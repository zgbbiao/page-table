/*
 * @Descripti}Author: your name
 @Date: 2019-10-10 14:41:29
 * @LastEditTime: 2020-04-03 21:12:56
 * @LastEditors: Please set LastEditors
 */
export default {
  data() {
    return {
      rowSelectionOptions: {
        selectedRowKeys: [],
        selectedRows: []
      },
      rowSelectionOptionsPagation: {}
    }
  },
  computed: {
    tableBind() {
      return {
        rowSelection: {
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedRows) => {
            this.selectChange(selectedRowKeys, selectedRows)
          },
          getCheckboxProps: record => ({
            props: {
              disabled: !!record.isDisabled
            }
          }),
          ...this.rowSelectionOptions
        }
      }
    }
  },
  methods: {
    selectChange(selectedRowKeys, selectedRows) {
      this.setSelectedRow(selectedRowKeys, selectedRows)
      if (this.pagination) {
        this.rowSelectionOptionsPagation[this.pagination.current] = {
          selectedRowKeys,
          selectedRows
        }
      }
    },
    handleCencelSelect() {
      this.setSelectedRow([], [])
      this.rowSelectionOptionsPagation = {}
    },
    handleChage(pagination, filters, sorter) {
      if (this.pagination) {
        this.pagination = pagination
        this.getData && this.getData()
        if (this.rowSelectionOptionsPagation[this.pagination.current]) {
          this.setSelectedRow(
            this.rowSelectionOptionsPagation[this.pagination.current]
              .selectedRowKeys || [],
            this.rowSelectionOptionsPagation[this.pagination.current]
              .selectedRows || []
          )
        } else {
          this.setSelectedRow([], [])
        }
      }
    },
    setSelectedRow(selectedRowKeys, selectedRows) {
      this.$set(this.rowSelectionOptions, 'selectedRowKeys', selectedRowKeys)
      this.$set(this.rowSelectionOptions, 'selectedRows', selectedRows)
      this.$set(this, 'rowSelectionOptions', { ...this.rowSelectionOptions })
    },
    getCheckboxAll() {
      const list = []
      Object.values(this.rowSelectionOptionsPagation).forEach(item => {
        list.push(...item.selectedRows)
      })
      return list
    },
    setDefaultSelect(selectedRowKeys, selectedRows, current) {
      this.setSelectedRow(selectedRowKeys, selectedRows)
      if (this.pagination) {
        this.rowSelectionOptionsPagation[current] = {
          selectedRowKeys,
          selectedRows
        }
      }
    }
  }
}
