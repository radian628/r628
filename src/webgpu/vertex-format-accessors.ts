import { vertexFormatToWgslType } from "./converters";
import { Attribute } from "./partial-pipelines";

export function vertexFormatGetter(
  storageBufferName: string,
  attribute: Attribute,
) {
  const wgslType = vertexFormatToWgslType(attribute.format);
  const signature = `fn ${storageBufferName}_${attribute}_get(index: u32) -> ${wgslType}`;

  return `${signature} {
    return ${storageBufferName}
  }`;
}
