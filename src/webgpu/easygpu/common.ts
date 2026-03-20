export function mapFlags(flags: string[]): Record<string, boolean> {
  if (flags.length === 0) return {};
  return {
    [flags[0]]: true,
    ...mapFlags(flags.slice(1)),
  };
}
