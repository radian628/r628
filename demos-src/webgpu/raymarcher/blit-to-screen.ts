import BlitToScreen from "./blit-to-screen.wgsl?raw";
// import { UNet, initUNetFromURL } from "oidn-web";

export async function initBlitToScreen(
  device: GPUDevice,
  adapterInfo: GPUAdapterInfo,
  textures: GPUTexture[]
) {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  canvas.style = `
position: absolute;
top: 0;
left: 0;
width: 100vw;
height: 100vh;
`;

  // const denoiser = await initUNetFromURL(
  //   "./rt_hdr_alb_nrm.tza",
  //   {
  //     device,
  //     adapterInfo,
  //   },
  //   {
  //     aux: true,
  //     hdr: true,
  //   }
  // );

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  window.addEventListener("resize", resize);

  resize();
  const ctx = canvas.getContext("webgpu");

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  ctx!.configure({
    device,
    format: presentationFormat,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        sampler: { type: "non-filtering" },
        visibility: GPUShaderStage.FRAGMENT,
      },
      {
        binding: 1,
        texture: {
          sampleType: "unfilterable-float",
          viewDimension: "2d-array",
        },
        visibility: GPUShaderStage.FRAGMENT,
      },
    ],
  });

  const blitToScreenPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    vertex: {
      module: device.createShaderModule({
        code: BlitToScreen,
      }),
    },
    fragment: {
      module: device.createShaderModule({
        code: BlitToScreen,
      }),
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const sampler = device.createSampler({
    minFilter: "nearest",
    magFilter: "nearest",
  });

  let bindGroups: GPUBindGroup[] = [];

  function updateTextures(textures: GPUTexture[]) {
    bindGroups = textures.map((t) =>
      device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: sampler,
          },
          { binding: 1, resource: t },
        ],
      })
    );
  }

  updateTextures(textures);

  return {
    canvas: canvas,
    calcFrame: (bindGroupIndex: number) => {
      const commandEncoder = device.createCommandEncoder();

      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: ctx!.getCurrentTexture().createView(),
            clearValue: [0, 0, 0, 1],
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });

      const bindGroup = bindGroups[bindGroupIndex];

      passEncoder.setPipeline(blitToScreenPipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.draw(6);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
    },
    updateTextures,
  };
}
