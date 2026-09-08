export function getPaginationItems(currentPage, totalPages) {
  const total = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(total, Math.max(1, Number(currentPage) || 1));

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const visiblePages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items = [];

  visiblePages.forEach((page, index) => {
    const previous = visiblePages[index - 1];
    if (previous && page - previous > 1) items.push(`ellipsis-${previous}`);
    items.push(page);
  });

  return items;
}
