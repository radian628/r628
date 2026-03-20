import { Mat4, scale4, Vec3, Vec4 } from "../../math/vector.generated";
import { range, rangeFrom } from "../../range";
import { typeDevice } from "../easygpu/easygpu";
import {
  OutputFormat,
  pipelineRenderpass,
  wrapDevice,
  WrappedBindGroupLayoutGeneric,
  WrappedBindGroupVertexBuffer,
  WrappedBindGroupVertexBufferGeneric,
} from "../partial-pipelines";
import { struct, WGSLStructSpec } from "../wgsl-struct-layout-generator";

export async function lineRenderer(
  device: GPUDevice,
  outputFormat: GPUTextureFormat,
  settings?: {
    multisample: GPUMultisampleState & { count: 1 | 4 };
  },
) {
  const td = typeDevice(device);

  const depthTexFormat = td.textureFormat(
    {
      name: "depth",
      format: "depth32float",
      sampleCount: settings?.multisample?.count ?? 1,
      viewDimension: "2d",
      visibility: ["fragment"],
    },
    "render-attachment",
  );

  const colorTexFormat = td.textureFormat(
    {
      name: "color",
      format: outputFormat,
      sampleCount: settings?.multisample?.count ?? 1,
      viewDimension: "2d",
      dimension: "2d",
      visibility: ["fragment"],
    },
    "render-attachment",
  );

  const EVERYWHERE =
    GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;

  const geometryBufferFormat = td.vertexBufferFormat("geometry", 8, [
    {
      name: "geometryPosition",
      format: "float32x2",
      offset: 0,
    },
  ] as const);

  const quad = geometryBufferFormat.quickCreate([
    {
      geometryPosition: [-1, -1],
    },
    {
      geometryPosition: [1, -1],
    },
    {
      geometryPosition: [-1, 1],
    },
    {
      geometryPosition: [1, -1],
    },
    {
      geometryPosition: [-1, 1],
    },
    {
      geometryPosition: [1, 1],
    },
  ]);

  const pointInstanceBufferFormat = td.instanceBufferFormat("points", 20, [
    {
      name: "position",
      format: "float32x3",
      offset: 0,
    },
    {
      name: "size",
      format: "float32",
      offset: 12,
    },
    {
      name: "color",
      format: "unorm8x4",
      offset: 16,
    },
  ] as const);

  const lineSegInstanceBufferFormat1 = td.instanceBufferFormat(
    "lineSegments1",
    20,
    [
      {
        name: "position1",
        format: "float32x3",
        offset: 0,
      },
      {
        name: "size1",
        format: "float32",
        offset: 12,
      },
      {
        name: "color1",
        format: "unorm8x4",
        offset: 16,
      },
    ] as const,
  );
  const lineSegInstanceBufferFormat2 = td.instanceBufferFormat(
    "lineSegments2",
    20,
    [
      {
        name: "position2",
        format: "float32x3",
        offset: 0,
      },
      {
        name: "size2",
        format: "float32",
        offset: 12,
      },
      {
        name: "color2",
        format: "unorm8x4",
        offset: 16,
      },
    ] as const,
  );

  const uniforms = td.uniformBufferFormat(
    "params",
    struct("Params", {
      mvp: "mat4x4f",
      aspect: "f32",
    }),
  );

  const perFrameBindGroup = td.bindGroupFormat("perFrame", uniforms);

  const blend: GPUBlendState | undefined = undefined; /* {
    color: {
      operation: "add",
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      // dstFactor: "zero",
    },
    alpha: {
      operation: "add",
      srcFactor: "one",
      // dstFactor: "one",
      dstFactor: "one-minus-src-alpha"
      // dstFactor: "zero",
    },
  };*/

  // const blend = undefined;

  const pointPipeline = await td.renderPipeline({
    multisample: settings?.multisample,
    depthStencil: {
      format: "depth32float",
      depthCompare: "less",
      depthWriteEnabled: true,
    },
    inputs: [geometryBufferFormat, pointInstanceBufferFormat] as const,
    outputs: {
      color: {
        format: outputFormat,
        blend,
      },
    },
    bindGroups: [perFrameBindGroup] as const,
    vertex: `
      var frag: FragInput;
      let pos = params.mvp * vec4f(vertex.position, 1.0); 
      frag.position = vec4f(pos.xy + 
        vertex.geometryPosition * vertex.size
        * vec2f(1.0, params.aspect)
      , pos.zw);
      frag.signedUv = vertex.geometryPosition;
      frag.color = vertex.color;
      frag.size = vertex.size;
      return frag;
    `,
    fragment: {
      function: `
      var pixel: FragOutput;

      let mag = length(input.signedUv);

      if (mag > 1.0) { discard; }
      pixel.color = input.color;

      return pixel;`,
      struct: `@builtin(position) position : vec4f,
@location(0) color : vec4f,
@location(1) signedUv : vec2f,
@location(2) size : f32,`,
    },
  });

  const linePipeline = await td.renderPipeline({
    multisample: settings?.multisample,
    depthStencil: {
      format: "depth32float",
      depthCompare: "less",
      depthWriteEnabled: true,
    },
    inputs: [
      geometryBufferFormat,
      lineSegInstanceBufferFormat1,
      lineSegInstanceBufferFormat2,
    ] as const,
    outputs: {
      color: {
        format: outputFormat,
        blend,
      },
    },
    bindGroups: [perFrameBindGroup] as const,
    vertex: `
      var frag: FragInput;
      let pos1 = params.mvp * vec4f(vertex.position1, 1.0); 
      let pos2 = params.mvp * vec4f(vertex.position2, 1.0); 

      let offset = normalize(pos2.xy / pos2.w - pos1.xy / pos1.w);

      var localy = vec3f(
        -offset.y, offset.x * params.aspect
      , 0.0);


      let uv = vertex.geometryPosition * 0.5 + 0.5;

      let size = mix(
        vertex.size1,
        vertex.size2,
        uv.x 
      );

      frag.position = vec4f(
        mix(
          pos1.xy,
          pos2.xy,
          uv.x 
        ), 
        mix(
          pos1.zw,
          pos2.zw,
          uv.x 
        )
      ) + vec4f(
        localy * vertex.geometryPosition.y * size, 
        0.0  
      );

      frag.color = mix(vertex.color1, vertex.color2, uv.x);

      frag.size = size / frag.position.z;
      frag.signedUv = vertex.geometryPosition;

      return frag;
    `,
    fragment: {
      function: `
      var pixel: FragOutput;
      pixel.color = input.color;
      return pixel;`,
      struct: `@location(0) color : vec4f,
@builtin(position) position : vec4f,
@location(1) signedUv : vec2f,
@location(2) size : f32,`,
    },
  });

  return {
    depthTexFormat,
    colorTexFormat,
    pointInstanceBufferFormat,
    lineSegInstanceBufferFormat1,
    lineSegInstanceBufferFormat2,
    geometryBufferFormat,
    uniforms,
    quad,
    blend,
    perFrameBindGroup,
    linePipeline,
    pointPipeline,
    createEmptyLines(count: number, depthLoadOp: "clear" | "load") {
      const perFrameUniforms = uniforms.new(1);

      const perFrame = perFrameBindGroup.new({
        params: perFrameUniforms,
      });

      const vertexBuf = pointInstanceBufferFormat.new(count);

      const pass = device.createRenderBundleEncoder({
        colorFormats: [outputFormat],
        depthStencilFormat: depthTexFormat.desc.format,
      });

      pass.setPipeline(pointPipeline);

      pointPipeline.bind(pass, {
        points: vertexBuf,
        geometry: quad,
        perFrame,
      });

      pass.draw(6, count);

      pass.setPipeline(linePipeline);
      linePipeline.bind(pass, {
        lineSegments1: lineSegInstanceBufferFormat1.reinterpret(vertexBuf),
        lineSegments2: [
          lineSegInstanceBufferFormat2.reinterpret(vertexBuf),
          20,
        ],
        geometry: quad,
      });

      pass.draw(6, count - 1);

      const bundle = pass.finish();

      return {
        buffer: vertexBuf,
        draw(target: GPUTexture, depthTarget: GPUTexture, transform: Mat4) {
          uniforms.fill(perFrameUniforms, 0, {
            aspect: target.width / target.height,
            mvp: transform,
          });

          const encoder = device.createCommandEncoder();

          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: target,
                loadOp: "load",
                storeOp: "store",
              },
            ],
            depthStencilAttachment: {
              view: depthTarget,
              depthClearValue: 1.0,
              depthLoadOp: depthLoadOp,
              depthStoreOp: "store",
            },
          });

          pass.executeBundles([bundle]);

          pass.end();

          device.queue.submit([encoder.finish()]);
        },
      };
    },
    createLines(
      points: Vec3[],
      color: Vec4,
      thickness: number,
      depthLoadOp: "clear" | "load",
    ) {
      const perFrameUniforms = uniforms.new(1);

      const perFrame = perFrameBindGroup.new({
        params: perFrameUniforms,
      });

      const vertexBuf = pointInstanceBufferFormat.quickCreate(
        points.map((position) => ({
          position,
          color,
          size: thickness,
        })),
      );

      const pass = device.createRenderBundleEncoder({
        colorFormats: [outputFormat],
        depthStencilFormat: depthTexFormat.desc.format,
      });

      pass.setPipeline(pointPipeline);

      pointPipeline.bind(pass, {
        points: vertexBuf,
        geometry: quad,
        perFrame,
      });

      pass.draw(6, points.length);

      pass.setPipeline(linePipeline);

      linePipeline.bind(pass, {
        lineSegments1: lineSegInstanceBufferFormat1.reinterpret(vertexBuf),
        lineSegments2: [
          lineSegInstanceBufferFormat2.reinterpret(vertexBuf),
          20,
        ],
        geometry: quad,
      });

      pass.draw(6, points.length - 1);

      const bundle = pass.finish();

      return {
        draw(target: GPUTexture, depthTarget: GPUTexture, transform: Mat4) {
          uniforms.fill(perFrameUniforms, 0, {
            aspect: target.width / target.height,
            mvp: transform,
          });

          const encoder = device.createCommandEncoder();

          const pass = encoder.beginRenderPass({
            colorAttachments: [
              {
                view: target,
                loadOp: "load",
                storeOp: "store",
              },
            ],
            depthStencilAttachment: {
              view: depthTarget,
              depthClearValue: 1.0,
              depthLoadOp: depthLoadOp,
              depthStoreOp: "store",
            },
          });

          pass.executeBundles([bundle]);

          pass.end();

          device.queue.submit([encoder.finish()]);
        },
      };
    },
    drawLinesSimple(
      target: GPUTexture,
      depthTarget: GPUTexture,
      depthLoadOp: "clear" | "load",
      points: Vec3[],
      color: Vec4,
      thickness: number,
      transform: Mat4,
    ) {
      const vertexBuf = pointInstanceBufferFormat.quickCreate(
        points.map((position) => ({
          position,
          color,
          size: thickness,
        })),
      );

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: target,
            loadOp: "load",
            storeOp: "store",
          },
        ],
        depthStencilAttachment: {
          view: depthTarget,
          depthClearValue: 1.0,
          depthLoadOp: depthLoadOp,
          depthStoreOp: "store",
        },
      });

      pass.setPipeline(pointPipeline);

      const bg = perFrameBindGroup.new({
        params: uniforms.quickCreate({
          mvp: transform,
          aspect: target.width / target.height,
        }),
      });

      pointPipeline.bind(pass, {
        points: vertexBuf,
        geometry: quad,
        perFrame: bg,
      });

      pass.draw(6, points.length);

      pass.setPipeline(linePipeline);

      linePipeline.bind(pass, {
        lineSegments1: lineSegInstanceBufferFormat1.reinterpret(vertexBuf),
        lineSegments2: [
          lineSegInstanceBufferFormat2.reinterpret(vertexBuf),
          20,
        ],
        geometry: quad,
      });

      pass.draw(6, points.length - 1);

      pass.end();

      device.queue.submit([encoder.finish()]);
    },
  };
}
