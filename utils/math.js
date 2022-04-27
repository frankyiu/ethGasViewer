export const toGwei = (ele) => {
  if (ele) {
    return (Number(ele) / 1000000000).toFixed(2);
  }

  return null;
};

export const asc = (arr) => arr.sort((a, b) => a - b);

export const quartile = (arr, q) => {
  if (!arr || arr.length === 0) {
    return 'N/A';
  }

  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = (pos - base);

  if (sorted[base + 1] !== undefined) {
    const numBase = Number(sorted[base]);
    const numNext = Number(sorted[base + 1]);

    return (numBase + rest * (numNext - numBase)).toFixed(2);
  }

  return sorted[base];
};
