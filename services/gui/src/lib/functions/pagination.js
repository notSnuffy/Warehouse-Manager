/**
 * Function to paginate a list of items.
 * @param {Array} list - The list of items to paginate.
 * @param {number} currentPage - The current page number.
 * @param {number} itemsPerPage - The number of items per page.
 * @return {Array} - A subset of the list representing the items on the current page.
 */
function paginateList(list, currentPage, itemsPerPage) {
  const totalShapes = list.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalShapes);
  return list.slice(startIndex, endIndex);
}

/**
 * Function to render pagination controls for a list of items.
 * @param {Array} list - The list of items to paginate.
 * @param {number} currentPage - The current page number.
 * @param {number} itemsPerPage - The number of items per page.
 * @param {HTMLElement} paginationControlsElement - The HTML element to render the pagination controls into.
 * @param {Function} onPageChange - Callback function to call when the page changes.
 * @return {void}
 */
function renderPaginationControls(
  list,
  currentPage,
  itemsPerPage,
  paginationControlsElement,
  onPageChange,
) {
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const maxVisiblePages = 5;
  paginationControlsElement.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }
  const createPageItem = (
    setPage,
    itemLabel = setPage,
    active = false,
    disabled = false,
  ) => {
    const li = document.createElement("li");
    li.className = `page-item ${active ? "active" : ""}${disabled ? "disabled" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${itemLabel}</a>`;
    if (!disabled && !active) {
      li.addEventListener("click", () => {
        onPageChange(setPage);
      });
    }
    return li;
  };

  paginationControlsElement.appendChild(
    createPageItem(currentPage - 1, "Previous", false, currentPage === 1),
  );

  const addEllipsis = () => {
    const li = document.createElement("li");
    li.className = "page-item disabled";
    li.innerHTML = `<span class="page-link">…</span>`;
    paginationControlsElement.appendChild(li);
  };

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(currentPage + 2, totalPages);

  if (currentPage <= 3) {
    endPage = Math.min(maxVisiblePages, totalPages);
  } else if (currentPage >= totalPages - 2) {
    startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
  }

  if (startPage > 1) {
    paginationControlsElement.appendChild(createPageItem(1));
    if (startPage > 2) addEllipsis();
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationControlsElement.appendChild(
      createPageItem(i, i, i === currentPage),
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis();
    paginationControlsElement.appendChild(createPageItem(totalPages));
  }

  paginationControlsElement.appendChild(
    createPageItem(currentPage + 1, "Next", false, currentPage === totalPages),
  );
}
export { paginateList, renderPaginationControls };
