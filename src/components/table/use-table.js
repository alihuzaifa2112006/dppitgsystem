import { useState, useEffect, useCallback } from 'react';

// Optional: use a unique key per table (default 'tablePreferences')
const STORAGE_KEY = 'tablePreferences';

// Load preferences from localStorage
const loadPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading table preferences:', error);
    return {};
  }
};

// Save preferences to localStorage
const savePreferences = (prefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving table preferences:', error);
  }
};

export default function useTable(props) {
  const loadedPrefs = loadPreferences();

  const [dense, setDense] = useState(props?.defaultDense ?? loadedPrefs.dense ?? true);
  const [page, setPage] = useState(props?.defaultCurrentPage ?? 0);
  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy ?? loadedPrefs.orderBy ?? 'name');
  const [rowsPerPage, setRowsPerPage] = useState(
    props?.defaultRowsPerPage ?? loadedPrefs.rowsPerPage ?? 25
  );
  const [order, setOrder] = useState(props?.defaultOrder ?? loadedPrefs.order ?? 'asc');
  const [selected, setSelected] = useState(props?.defaultSelected ?? []);

  // Save preferences whenever important values change
  useEffect(() => {
    savePreferences({
      dense,
      rowsPerPage,
      orderBy,
      order,
      // page,
    });
  }, [dense, rowsPerPage, orderBy, order]);

  const onSort = useCallback(
    (id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (orderBy !== id) {
        setOrder('asc');
        setOrderBy(id);
      } else {
        setOrder(isAsc ? 'desc' : 'asc');
      }
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (id) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = [...selected, id];
      } else if (selectedIndex === 0) {
        newSelected = selected.slice(1);
      } else if (selectedIndex === selected.length - 1) {
        newSelected = selected.slice(0, -1);
      } else if (selectedIndex > 0) {
        newSelected = [...selected.slice(0, selectedIndex), ...selected.slice(selectedIndex + 1)];
      }
      setSelected(newSelected);
    },
    [selected]
  );

  const onSelectAllRows = useCallback((checked, newSelecteds) => {
    if (checked) {
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  }, []);

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  }, []);

  const onChangeDense = useCallback(() => {
    setDense((prev) => !prev);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onUpdatePageDeleteRow = useCallback(
    (dataLength) => {
      const totalItems = dataLength - 1;
      const totalPages = Math.ceil(totalItems / rowsPerPage);

      if (page + 1 > totalPages) {
        setPage((prev) => prev - 1);
      }
    },
    [page, rowsPerPage]
  );

  const onUpdatePageDeleteRows = useCallback(
    (dataLength, selectedRowsLength) => {
      const totalItems = dataLength - selectedRowsLength;
      const totalPages = Math.ceil(totalItems / rowsPerPage);

      if (page + 1 > totalPages) {
        setPage((prev) => prev - 1);
      }
    },
    [page, rowsPerPage]
  );

  return {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,
    //
    setDense,
    setPage,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
    //
    onSort,
    onSelectRow,
    onSelectAllRows,
    onChangePage,
    onChangeRowsPerPage,
    onChangeDense,
    onResetPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,
  };
}
