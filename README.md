
```
<template>
  <div class="flow-define" style="margin-top: -24px;">
    <CommonPageTable
      ref="PageTable"
      v-model="searchData"
      :columns="columns"
      :data="listData"
      :search-list="searchList"
      :search-data="searchData"
      :search-btn="searchBtn"
      :right-btns="rightBtns"
      :table-bind="tableBind"
      :slots="slots"
      :pagination="pagination"
      :header-layout="headerLayout"
      :label-width="labelWidth"
      :global-tootip="globalTootip"
      :pagination-bind="paginationBind"
      @change="handleChage"
    >
      <template v-slot:table-header-top>
        <div class="table-header-top">
          <div
            v-if="topRightBtns.length"
            style="min-height: 56px; padding: 9px; border-bottom: 1px solid #f1f1f1;"
          >
            <div class="table-header-top-left">
              <span
                style="line-height: 38px; font-size: 16px; font-weight: 600;"
                >事件定义列表</span
              >
            </div>
            <div class="table-header-top-right">
              <span
                v-for="(item, index) in topRightBtns"
                :key="index"
                style="margin-left: 10px"
              >
                <a-button
                  v-if="!item.type || item.type === 'button'"
                  v-bind="{
                    ...(item.bind || {})
                  }"
                  @click="item.click"
                >
                  <i
                    v-if="item.icon && item.iconTag !== 'a-icon'"
                    :class="item.icon"
                  />
                  <a-icon
                    v-if="item.icon && item.iconTag === 'a-icon'"
                    :type="item.icon"
                  />
                  {{ item.label }}
                  <i
                    v-if="item.beforeIcon && item.iconTag !== 'a-icon'"
                    :class="item.beforeIcon"
                  />
                  <a-icon
                    v-if="item.beforeIcon && item.iconTag === 'a-icon'"
                    :type="item.beforeIcon"
                  />
                </a-button>
                <div v-if="item.type === 'slot' && item.show !== false">
                  <template v-for="slotItem in item.slots || []">
                    <slot :name="slotItem"></slot>
                  </template>
                </div>
              </span>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:operate="{ scope }">
        <div class="operation">
          <operate
            :operate-index="scope.index"
            :operate-obj="scope.row"
            :operate-arr="statusObj[scope.row.state].operateArr"
          ></operate>
        </div>
      </template>
      <!-- { text, record, index, filterItem } -->
      <template v-slot:state="{ scope }">
        <div
          class="script-states"
          :style="{
            ...statusObj[scope.filterItem.value].style
          }"
        >
          {{ scope.filterItem.label }}
        </div>
      </template>
      <template v-slot:createTime="{ scope }">
        {{ scope.record | timeFilters }}
      </template>
      <template v-slot:lastUpdateTime="{ scope }">
        {{ scope.record | timeFilters }}
      </template>
      <template v-slot:version="{ scope }">
        V{{ scope.record }}
      </template>
    </CommonPageTable>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import moment from 'moment'
import lodash from 'lodash'
import tableCheckboxMixins from '@/mixins/tableCheckbox.js'
import confirmMessageMixins from '@/mixins/confirmMessage.js'
import {
  getProcessEventPage,
  setProcessEventState as POSTsetProcessEventState,
  deleteProcessEvent
} from '@/api/api'
import operate from '@/pages/index/components/operate'
import { userAppList as POSTuserAppList } from '@/api/app-api'
let userAppList = JSON.parse(localStorage.getItem('userAppList')) || []
const yearFormat = 'YYYY-MM-DD HH:mm'
export default {
  components: { operate },
  filters: {
    timeFilters(value) {
      if (value && value !== '-') {
        return moment(value).format(yearFormat)
      }
      return value
    }
  },
  mixins: [tableCheckboxMixins, confirmMessageMixins],
  props: {},
  data() {
    userAppList = JSON.parse(localStorage.getItem('userAppList'))
    return {
      yearFormat,
      listData: [],
      searchData: {
        // annual: moment(new Date()).format('YYYY')
      },
      slots: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      headerLayout: {
        leftSpan: 24,
        rightSpan: 0
      },
      userInfo: {},
      isYearPickerOpen: false,
      isAbledOk: false,
      userAppList,
      labelWidth: '72px',
      colWidth: 200,
      statusObj: {
        0: {
          text: '停用中',
          style: {
            color: '#FF584C',
            background: '#FFE7E5',
            borderColor: '#FFA099'
          },
          operateArr: {}
        },
        1: {
          text: '已启用',
          style: {
            color: '#17A514',
            background: '#DFFFDF',
            borderColor: '#92EF90'
          },
          operateArr: {}
        },
        2: {
          text: '草稿',
          style: {
            color: '#96A2AF',
            background: '#F3F7FC',
            borderColor: '#C6CFD9'
          },
          operateArr: {}
        }
      },

      // 操作列表
      operateArr4Default: {
        view: {
          iconName: 'view',
          // operateFn: this.handleWatch,
          operateFn: this.handleView,
          text: '查看'
        },
        edit: {
          iconName: 'edit',
          operateFn: this.handleEdit,
          text: '编辑'
        },
        copy: {
          iconName: 'copy',
          // operateFn: this.handleCopy,
          text: '复制'
        },
        delete: {
          iconName: 'delete',
          // operateFn: this.handleDel,
          operateFn: this.handleDelete,
          text: '删除'
        },
        disable: {
          iconName: 'disable',
          operateFn: this.handleDisable,
          text: '停用'
        },
        enable: {
          iconName: 'enable',
          operateFn: this.handleEnable,
          text: '启用'
        },
        usualDelete: {
          iconName: 'usualDelete',
          text: '删除'
        },
        publish: {
          iconName: 'publish',
          // operateFn: this.handlePublish,
          text: '发布'
        },
        reuse: {
          iconName: 'reuse',
          // operateFn: this.handleReuse,
          text: '复用'
        }
      },
      globalTootip: {
        overlayClassName: ''
      },
      paginationBind: {
        'show-total': total => `共${total}条`
      }
    }
  },
  computed: {
    ...mapGetters(['getHomeState']),
    curYearValue() {
      return this.getHomeState.curYearValue
    },
    scriptTypes() {
      return this.getHomeState.scriptTypes
    },
    processStatus() {
      return this.getHomeState.eventprocessStatus
    },
    tableBind() {
      return {
        // rowSelection: {
        //   // columnTitle: '选择',
        //   type: 'checkbox',
        //   onChange: (selectedRowKeys, selectedRows) => {
        //     this.selectChange(selectedRowKeys, selectedRows)
        //   },
        //   ...this.rowSelectionOptions
        // },
        scroll: { x: (this.columns.length - 2) * this.colWidth }
      }
    },
    searchList() {
      const that = this
      const listRes = lodash.uniqBy(
        (this.userAppList.appInfoList || []).concat(
          userAppList.appInfoList || []
        ),
        'id'
      )
      const list = [
        {
          label: '应用名称',
          type: 'select',
          prop: 'appId',
          placeholder: '请输入应用名称',
          span: 12,
          className: 'form-item-align',
          bind: {
            emptySelect: true,
            'show-search': true,
            filterOption(inputValue, option) {
              // console.log(inputValue)
              // console.log(option)
              return (
                option.componentOptions.children[0].text
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase()) >= 0
              )
            }
          },
          listeners: {
            change: value => {},
            dropdownVisibleChange(open) {
              if (open) {
                that.handleSelectFocus()
              }
            }
          },
          list: [{ label: '全部', value: '' }].concat(
            listRes.map(item => {
              return {
                ...item,
                value: item.id,
                label: item.appName
              }
            })
          )
        },
        {
          label: '事件名称',
          type: 'input',
          prop: 'eventName',
          placeholder: '请输入事件名称',
          span: 12,
          className: 'form-item-align',
          listeners: {
            change: value => {},
            pressEnter: that.handleTableSearch
          }
        },
        {
          label: '事件编号',
          type: 'input',
          prop: 'eventNo',
          placeholder: '请输入事件编号',
          span: 12,
          className: 'form-item-align',
          listeners: {
            change: value => {},
            pressEnter: that.handleTableSearch
          }
        },
        {
          label: '状态',
          type: 'select',
          prop: 'state',
          placeholder: '请选择状态',
          span: 12,
          className: 'form-item-align',
          bind: {
            emptySelect: true
          },
          list: [{ label: '全部', value: '' }].concat(this.processStatus),
          listeners: {
            change: value => {}
          }
        }
        // {
        //   label: '脚本类型',
        //   type: 'select',
        //   prop: 'type',
        //   placeholder: '请选择脚本类型',
        //   span: 12,
        //   bind: {
        //     emptySelect: true
        //   },
        //   list: [{ label: '全部', value: '' }].concat(this.scriptTypes),
        //   className: 'form-item-align',
        //   listeners: {
        //     change: value => {}
        //   }
        // }
      ]
      return list
    },
    columns() {
      const colWidth = this.colWidth
      return [
        {
          title: '序号', // 列标题
          dataIndex: 'sort', // 数据的key
          key: 'sort', // 数据的key
          width: 60,
          fixed: 'left'
        },
        {
          title: '应用名称', // 列标题
          dataIndex: 'appName', // 数据的key
          key: 'appName', // 数据的key
          width: colWidth
        },
        {
          title: '事件名称', // 列标题
          dataIndex: 'eventName', // 数据的key
          key: 'eventName', // 数据的key
          width: colWidth
        },
        {
          title: '事件编号', // 列标题
          dataIndex: 'eventNo', // 数据的key
          key: 'eventNo', // 数据的key
          width: colWidth
        },
        {
          title: '版本', // 列标题
          dataIndex: 'version', // 数据的key
          key: 'version', // 数据的key
          width: colWidth,
          scopedSlots: { customRender: 'version' }
        },
        // {
        //   title: '脚本类型', // 列标题
        //   dataIndex: 'type', // 数据的key
        //   key: 'type', // 数据的key
        //   width: colWidth,
        //   list: this.scriptTypes
        // },
        {
          title: '创建人', // 列标题
          dataIndex: 'creatorName', // 数据的key
          key: 'creatorName', // 数据的key
          width: colWidth
        },
        {
          title: '创建时间', // 列标题
          dataIndex: 'createTime', // 数据的key
          key: 'createTime', // 数据的key
          width: colWidth,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '更新人', // 列标题
          dataIndex: 'lastUpdateUsername', // 数据的key
          key: 'lastUpdateUsername', // 数据的key
          width: colWidth
        },
        {
          title: '更新时间', // 列标题
          dataIndex: 'lastUpdateTime', // 数据的key
          key: 'lastUpdateTime', // 数据的key
          width: colWidth,
          scopedSlots: { customRender: 'lastUpdateTime' }
        },
        {
          title: '状态', // 列标题
          dataIndex: 'state', // 数据的key
          key: 'state', // 数据的key
          width: colWidth,
          list: this.processStatus,
          scopedSlots: { customRender: 'state' }
        },
        {
          title: '操作', // 列标题
          dataIndex: 'operate', // 数据的key
          key: 'operate', // 数据的key
          width: 100,
          scopedSlots: { customRender: 'operate' },
          fixed: 'right'
        }
      ]
    },
    searchBtn() {
      const that = this
      return [
        {
          label: '查询',
          click: () => {
            that.handleTableSearch()
          }
        },
        {
          label: '重置',
          bind: {
            type: 'default'
          },
          click: () => {
            that.handleTableReset()
          }
        }
      ]
    },
    rightBtns() {
      // const that = this
      return [
        // {
        //   label: '查询',
        //   click: () => {
        //     that.handleTableSearch()
        //   }
        // }
      ]
    },
    topRightBtns() {
      return [
        {
          label: '新增',
          icon: 'plus',
          iconTag: 'a-icon',
          bind: {
            type: 'primary'
          },
          click: () => {
            // this.handleGroups()
            this.handleAdd()
          }
        }
      ]
    }
  },
  watch: {
    rowSelectionOptions: {
      handler() {
        this.isAbledOk = !!this.getCheckboxAll().length
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.handleTableSearch()
  },
  mounted() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    this.setActionContent()
  },
  methods: {
    ...mapActions('index', []),
    async handleSelectFocus() {
      const userApp = await POSTuserAppList({})
      localStorage.setItem('userAppList', JSON.stringify(userApp))
      userAppList = JSON.parse(localStorage.getItem('userAppList'))
      this.userAppList = userAppList
    },
    handleClose() {
      this.$emit('close')
    },
    handleOk() {
      const list = this.getCheckboxAll()
      console.log(list)
      this.$emit('ok', list)
    },
    handleTabChange(list) {},
    handleTableSearch() {
      this.pagination.current = 1
      this.pagination.total = 0
      this.getData()
    },
    handleTableReset() {
      this.$refs.PageTable.reset()
      setTimeout(() => {
        this.handleTableSearch()
      })
    },
    getData() {
      getProcessEventPage({
        ...this.searchData,
        eventName: this.searchData.eventName
          ? this.searchData.eventName.trim()
          : this.searchData.eventName,
        eventNo: this.searchData.eventNo
          ? this.searchData.eventNo.trim()
          : this.searchData.eventNo,
        page: this.pagination.current,
        size: this.pagination.pageSize,
        annual: +this.curYearValue
      }).then(res => {
        // this.pagination.current = res.pageNo
        // this.pagination.pageSize = res.pageSize
        this.pagination.total = res.total
        this.listData = (res.records || []).map((item, index) => {
          return {
            ...item,
            sort:
              (this.pagination.current - 1) * this.pagination.pageSize +
              index +
              1
          }
        })
      })
    },
    setActionContent() {
      this.statusObj[0].operateArr = {
        usualOperate: [
          this.operateArr4Default.view,
          this.operateArr4Default.edit
        ],
        ellipsisOperate: [
          // this.operateArr4Default.disable,
          this.operateArr4Default.enable,
          this.operateArr4Default.delete
        ]
      }
      this.statusObj[1].operateArr = {
        usualOperate: [
          this.operateArr4Default.view,
          this.operateArr4Default.edit
        ],
        ellipsisOperate: [
          this.operateArr4Default.disable
          // this.operateArr4Default.delete
        ]
      }
      this.statusObj[2].operateArr = {
        usualOperate: [
          this.operateArr4Default.edit,
          this.operateArr4Default.usualDelete,
          this.operateArr4Default.publish
          // this.operateArr4Default.reuse
        ]
      }
    },
    handleAdd() {
      this.$router.push({
        path: '/home/eventmessage/add'
      })
    },
    handleEdit(record) {
      this.$router.push({
        path: '/home/eventmessage/add',
        query: {
          eventId: record.eventId,
          breadcrumbText: '编辑事件'
        }
      })
    },
    handleView(record) {
      this.$router.push({
        path: '/home/eventmessage/add',
        query: {
          eventId: record.eventId,
          view: true,
          breadcrumbText: '查看事件'
        }
      })
    },
    setProcessState(record) {
      return POSTsetProcessEventState({
        id: record.id,
        state: record.state
      })
    },
    handleEnable(record) {
      this.setProcessState({
        id: record.eventId,
        state: 1
      })
        .then(res => {
          this.$message.success('启用成功')
          this.getData()
        })
        .catch(() => {
          this.$message.error('启用失败')
        })
    },
    handleDisable(record) {
      this.setProcessState({
        id: record.eventId,
        state: 0
      })
        .then(res => {
          this.$message.success('停用成功')
          this.getData()
        })
        .catch(() => {
          this.$message.error('停用失败')
        })
    },
    async handleDelete(record) {
      console.log(record)
      const isT = await this.confirmDelete(
        {
          title: '删除脚本?',
          content: '确认删除脚本？'
        },
        true
      )
      console.log(isT)
      if (!isT) {
        return false
      }
      deleteProcessEvent({
        id: record.eventId
      })
        .then(res => {
          this.$message.success('删除成功')
          this.getData()
        })
        .catch(() => {
          this.$message.error('删除失败')
        })
    }
  }
}
</script>
<style lang="scss">
.reuse-modal {
  .ant-modal-body {
    padding: 24px;
  }
}
.script-states {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  font-size: 12px;
  width: 64px;
  height: 24px;
  border-radius: 2px;
  border: 1px solid #4a62e7;
}
</style>

```

```
title: {
      type: String,
      default: ''
    },
    tableBind: {
      type: Object,
      default: () => {}
    },
    searchData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    searchList: {
      type: Array,
      default: () => {
        return []
      }
    },
    searchBtn: {
      type: Array,
      default: () => {
        return []
      }
    },
    columns: {
      type: Array,
      default: () => {
        return []
      }
    },
    data: {
      type: Array,
      default: () => []
    },
    slots: {
      type: Array,
      default: () => []
    },
    headerLayout: {
      type: Object,
      default: () => {
        return {
          // leftSpan: 18,
          // rightSpan: 6
          leftSpan: 24,
          rightSpan: 24
        }
      }
    },
    rightBtns: {
      type: Array,
      default: () => {
        return []
      }
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }
    },
    value: {
      type: Object,
      default: () => {
        return {}
      }
    },
    tableBoxStyle: {
      type: [Object, String],
      default: () => {
        return {}
      }
    },
    formItemLayout: {
      type: Object,
      default: () => {
        return {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 24 }
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 24 }
          }
        }
      }
    },
    defaultFormItemLayout: {
      type: Object,
      default: () => {
        return {
          labelCol: {
            xs: { span: 0 },
            sm: { span: 0 }
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 24 }
          }
        }
      }
    },
    formItemBind: {
      type: Object,
      default: () => {
        return {
          colon: false
        }
      }
    },
    topRightBtns: {
      type: Array,
      default: () => {
        return []
      }
    }
```

```

        this.$emit('Formchange', val)
        this.$emit('input', val)
```

```


    searchList() {
      return [
        {
          type: 'input-search',
          prop: 'resourceName',
          placeholder: '请输入一级资源名称',
          formItemLayout: {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 24 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 24 }
            }
          },
          span: 9,
          className: 'form-item-align',
          listeners: {
            // search: this.handleSearch,
            pressEnter: this.handleSearch
          }
        },
        {
          label: '资源分组',
          type: 'select',
          prop: 'resourceGroup',
          placeholder: '选择资源分组',
          list: this.resurceGroups,
          bind: {
            labelInValue: true
          },
          span: 9,
          className: 'form-item-align',
          listeners: {
            change: value => {
              this.handleResourceTypeChange(value)
            }
          }
        }
      ]

      
    searchBtn() {
      return [
        {
          label: '查询',
          click: () => {
            this.handleSearch()
          }
        },
        {
          label: '重置',
          bind: {
            type: 'default'
          },
          click: () => {
            this.handleResetSearch()
          }
        }
      ]
    rightBtns() {
      return [
        // {
        //   label: `添加资源`,
        //   icon: 'gsd-icon-btnadd',
        //   click: () => {
        //     this.handleShowAddResource()
        //   }
        // },
        // {
        //   label: '校验失效资源',
        //   bind: {
        //     type: 'default'
        //   },
        //   click: () => {
        //     this.handleShowValidateResource()
        //   }
        // }
      ]
      slots: [
        {
          name: 'action',
          scopedSlots: {
            customRender: 'action'
          }
        },
        {
          name: 'disabled',
          scopedSlots: {
            customRender: 'disabled'
          }
        },
        {
          name: 'resourceType',
          scopedSlots: {
            customRender: 'resourceType'
          }
        }
      ],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
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
        },
        scroll: { x: 1188, y: false }
      }
    }
      headerLayout: {
        leftSpan: 24,
        rightSpan: 24
      },
```

```
import tableCheckboxMixins from 'page-table/tableCheckbox.js'
mixins: [tableCheckboxMixins],


// 获取选中的所有值
this.getCheckboxAll()
```