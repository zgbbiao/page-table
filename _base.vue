<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-02 15:57:41
 * @LastEditTime: 2020-07-20 16:41:04
 * @LastEditors: Please set LastEditors

## props:

1. title<string>  标题

2. tableBind<Object>  v-bind

3. searchData<Object>  搜索内容；

4. searchList<Array>  搜索的标签

 case:  searchList: [
        {
          label: '请输入系统或单位名称',
          type: 'input',
          prop: 'matchValue',
          placeholder: '请输入系统或单位名称'
        },
        {
          label: '物流类型名称',
          dom: 'select',
          prop: 'expressType',
          placeholder: '请选择物流类型名称',
          list: [
            {
              label: '派揽',
              value: '1'
            }
          ],
          change: () => {},
          span: 24,
          bind: {},
          formItemLayout: {
            labelCol: {
              xs: { span: 4 },
              sm: { span: 4 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 24 }
            }
          },
          render: (h, params) => {
            const label =
              (
                payMethods.find(
                  item => item.value === this.sFormData.wlPayMethod
                ) || {}
              ).label || ''
            return h('span', {
              domProps: {
                innerHTML: label
              }
            })
          }
        },
      ]
5. searchBtn <Array>  查询按钮
case:   // [
        //   {
        //     label: '查询',
        //     click: () => {}
        //   }
        // ]

6. columns <Array> table的columns
 当使用slot时， 需要与slots一起配合使用；
  case: [
    {
          title: '操作', // 列标题
          dataIndex: 'action', // 数据的key
          key: 'action', // 数据的key
          scopedSlots: { customRender: 'action' }  // 传递过去再传出来的参数
        }
  ]

  8. slots <Array> slot
  slots: [
        {
          name: 'action', // 必填
          scopedSlots: {
            customRender: 'action'
          }
        }
      ],

      9： data <Array>  table数据；

      10. headerLayout <Object>
      头部左右分栏；
      {
        leftSpan: 18,
        rightSpan: 6
      }

      11. rightBtns <Array> 右侧按钮
      
      12: pagination 分页
      {
        current: 1,
          pageSize: 10,
          total: 0
      }

      table-header-top

 -->
<template>
  <div class="pageTable-wrapper-wrapper">
    <div
      v-if="searchList.length || searchBtn.length || rightBtns.length"
      class="filter-wraper"
    >
      <a-form :form="form" layout="horizontal">
        <a-row :gutter="0">
          <a-col :span="headerLayout.leftSpan">
            <a-row :gutter="24">
              <a-col
                v-for="(item, index) in searchList"
                v-show="
                  index >= spanNum - 1 ? (isExpanded ? true : false) : true
                "
                :key="item.prop"
                :span="formSpan"
              >
                <!-- item.show !== false ? item.label :  -->
                <a-form-item
                  v-show="item.show !== false"
                  :label="''"
                  v-bind="{
                    ...(item.formItemLayout
                      ? item.formItemLayout
                      : item.label
                      ? formItemLayout
                      : defaultFormItemLayout),
                    ...formItemBind
                  }"
                  :class="item.className"
                >
                  <div class="form-item-wrapper">
                    <label v-if="item.label"> {{ item.label }} </label>
                    <div>
                      <a-input
                        v-if="item.type === 'input' && item.show !== false"
                        :ref="item.prop"
                        v-model="selfForm[item.prop]"
                        :placeholder="item.placeholder"
                        v-bind="item.bind || {}"
                        v-on="item.listeners || {}"
                      >
                        <a-icon
                          v-show="selfForm[item.prop]"
                          slot="suffix"
                          type="close-circle"
                          @click="emitEmpty(item.prop)"
                        />
                      </a-input>
                      <a-input-search
                        v-if="
                          item.type === 'input-search' && item.show !== false
                        "
                        :ref="item.prop"
                        v-model="selfForm[item.prop]"
                        :placeholder="item.placeholder"
                        v-bind="item.bind || {}"
                        v-on="item.listeners || {}"
                      >
                        <a-icon
                          v-if="selfForm[item.prop]"
                          slot="suffix"
                          type="close-circle"
                          @click="emitEmpty(item.prop)"
                        />
                      </a-input-search>
                      <a-range-picker
                        v-if="
                          item.type === 'range-picker' && item.show !== false
                        "
                        v-model="selfForm[item.prop]"
                        :placeholder="item.placeholders || []"
                        v-on="item.listeners || {}"
                      ></a-range-picker>
                      <a-select
                        v-if="item.type === 'select' && item.show !== false"
                        v-model="selfForm[item.prop]"
                        style="width: 100%;"
                        :default-value="item.defaultValue"
                        v-bind="item.bind"
                        :disabled="item.disabled"
                        :placeholder="item.placeholder"
                        @change="
                          (...args) => {
                            handleSelectChange(item, args)
                            item.change && item.change(...args)
                          }
                        "
                        v-on="item.listeners || {}"
                      >
                        <a-select-option
                          v-if="!(item.bind || {}).emptySelect"
                          value=""
                        >
                          请选择
                        </a-select-option>
                        <a-select-option
                          v-for="(item2, key) in item.list || []"
                          :key="'option' + key"
                          :value="item2.value"
                          >{{ item2.label }}</a-select-option
                        >
                      </a-select>
                      <div v-if="item.type === 'slot' && item.show !== false">
                        <template v-for="slotItem in item.slots || []">
                          <slot :name="slotItem"></slot>
                        </template>
                      </div>
                    </div>
                  </div>
                </a-form-item>
              </a-col>
              <!-- 需要让按钮放置在右边， 因此留出空格 -->
              <a-col
                v-for="item in emptyFormSpanNum"
                :key="item + 'empty'"
                :span="formSpan"
              >
              </a-col>
              <a-col v-if="searchBtn.length" :span="formSpan">
                <div class="searchBtn-wrapper">
                  <span
                    v-for="(item, index) in searchBtn"
                    :key="index"
                    class="btn-group leftBtns"
                    style="margin-bottom: 24px;"
                  >
                    <a-button
                      v-bind="{
                        type: 'primary',
                        ...(item.bind || {})
                      }"
                      @click="item.click"
                    >
                      {{ item.label }}
                    </a-button>
                  </span>
                  <span
                    v-if="searchList.length > spanNum - 1"
                    class="btn-group leftBtns"
                    style="margin-bottom: 24px;"
                  >
                    <a-button
                      v-if="!isExpanded"
                      type="link"
                      link
                      primary
                      @click="handleExpand"
                      >展开<a-icon type="down" style="font-size: 10px;"
                    /></a-button>
                    <a-button
                      v-else
                      type="link"
                      link
                      primary
                      @click="handleExpand"
                      >收起<a-icon type="up" style="font-size: 10px;"
                    /></a-button>
                  </span>
                </div>
              </a-col>
            </a-row>
          </a-col>
          <a-col :span="headerLayout.rightSpan">
            <span
              v-for="(item, index) in rightBtns"
              :key="index"
              class="rightBtns btn-group"
            >
              <a-form-item>
                <a-button
                  v-if="!item.type || item.type === 'button'"
                  v-bind="{
                    type: 'primary',
                    ...(item.bind || {})
                  }"
                  @click="item.click"
                >
                  <i v-if="item.icon" :class="item.icon" />
                  {{ item.label }}
                  <i v-if="item.beforeIcon" :class="item.beforeIcon" />
                </a-button>
                <div v-if="item.type === 'slot' && item.show !== false">
                  <template v-for="slotItem in item.slots || []">
                    <slot :name="slotItem"></slot>
                  </template>
                </div>
              </a-form-item>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="table-wrapper" :style="tableBoxStyle">
      <div class="table-header-top-wrapper clearfix">
        <slot name="table-header-top">
          <div class="table-header-top clearfix">
            <div v-if="topRightBtns.length">
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
                    <i v-if="item.icon" :class="item.icon" />
                    {{ item.label }}
                    <i v-if="item.beforeIcon" :class="item.beforeIcon" />
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
        </slot>
      </div>
      <a-table
        :columns="customColumns"
        :data-source="data"
        :pagination="false"
        v-bind="{ rowKey: 'key', ...tableBind }"
        v-on="$listeners"
      >
        <!-- <template
          v-for="slotItem in slots || []"
          :slot="slotItem.name"
          slot-scope="record, row, index"
        >
          <slot
            :name="slotItem.name"
            :scopedSlots="slotItem.scopedSlots || {}"
            :scope="{ record, row, index }"
          ></slot>-->
        <!-- 如果coumlus 带有List, 则进行遍历显示 -->
        <!--
          <span
            v-if="
              customColumns.find(cloumnItem => cloumnItem.key === slotItem.name) &&
                customColumns.find(cloumnItem => cloumnItem.key === slotItem.name)
                  .list &&
                customColumns.find(cloumnItem => cloumnItem.key === slotItem.name)
                  .list.length
            "
            :key="slotItem.name"
          >
            {{
              (
                customColumns
                  .find(cloumnItem => cloumnItem.key === slotItem.name)
                  .list.find(
                    labelItem => labelItem.value == row[slotItem.name]
                  ) || {}
              ).label
            }}
          </span>
        </template>-->
        <template
          v-for="slotItem in customColumns || []"
          :slot="slotItem.key"
          slot-scope="record, row, index"
        >
          <!-- 当外部使用slot -->
          <template
            v-if="
              slotItem.customCustomRender &&
                !(
                  slotItem.scopedSlots &&
                  slotItem.scopedSlots.customRender === 'expandedRowRender'
                )
            "
          >
            <!-- 当传了 slotItem.scopedSlots.customRender值的时候， 使用slot传递到外部去使用 -->
            <slot
              v-if="!(slotItem.list && slotItem.list.length)"
              :name="slotItem.key"
              :scopedSlots="slotItem.scopedSlots || {}"
              :scope="{ record, row, index }"
            ></slot>
            <!-- 当传了 slotItem.scopedSlots.customRender值的时候， 并且传了list（{key, value}）， 则自动进行判断显示对应的值 -->
            <span
              v-if="slotItem.list && slotItem.list.length"
              :key="slotItem.key"
            >
              <a-tooltip
                :key="slotItem.key"
                placement="topLeft"
                :title="
                  (
                    slotItem.list.find(
                      labelItem => labelItem.value == row[slotItem.key]
                    ) || {}
                  ).label
                "
                v-bind="
                  slotItem.tooltip || {
                    overlayClassName: 'CommonPageTable__wrapper--tooltip'
                  }
                "
                arrow-point-at-left
              >
                <div
                  :class="slotItem.ellipsis.type + '-elipsls'"
                  :style="{
                    'max-width': widthFilter(row, slotItem),
                    display: 'inline-block',
                    'vertical-align': 'middle'
                  }"
                  v-bind="slotItem.valuebind || {}"
                >
                  {{
                    (
                      slotItem.list.find(
                        labelItem => labelItem.value == row[slotItem.key]
                      ) || {}
                    ).label
                  }}
                </div>
              </a-tooltip>
            </span>
          </template>
          <!-- 当外部没有使用slot时， 给值加上tooltip -->
          <template
            v-if="
              !slotItem.customCustomRender &&
                !(
                  slotItem.scopedSlots &&
                  slotItem.scopedSlots.customRender === 'expandedRowRender'
                )
            "
          >
            <a-tooltip
              :key="slotItem.key"
              placement="topLeft"
              :title="record"
              v-bind="
                slotItem.tooltip || {
                  overlayClassName: 'CommonPageTable__wrapper--tooltip'
                }
              "
              arrow-point-at-left
            >
              <div
                class="one-elipsls"
                :style="{
                  'max-width': widthFilter(row, slotItem),
                  display: 'inline-block',
                  'vertical-align': 'middle'
                }"
                v-bind="slotItem.valuebind || {}"
              >
                {{ record }}
              </div>
            </a-tooltip>
          </template>
          <!-- 当传了 slotItem.scopedSlots.customRender值 === expandedRowRender的时候 -->
          <!-- 
            cloumns 使用示例
            {
          title: ' ', // 列标题
          dataIndex: 'expandedRowRender', // 数据的key
          key: 'expandedRowRender', // 数据的key
          // expandedRowRender
          width: '1px',
          colSpan: 1,
          scopedSlots: { customRender: 'expandedRowRender' }
        } -->
          <template
            v-if="
              slotItem.scopedSlots &&
                slotItem.scopedSlots.customRender === 'expandedRowRender'
            "
          >
            <slot
              :name="slotItem.key"
              :scopedSlots="slotItem.scopedSlots || {}"
              :scope="{ record, row, index }"
            ></slot>
          </template>
        </template>
      </a-table>
      <div class="table-header-top-wrapper">
        <slot name="table-footer-bottom"></slot>
      </div>
      <div
        v-if="
          pagination && pagination.total > pagination.pageSize && data.length
        "
        style="text-align: right; padding-top: 20px;"
      >
        <a-pagination
          :total="pagination.total"
          :current="pagination.current"
          :page-size="pagination.pageSize"
          show-quick-jumper
          @change="
            (current, pageSize) => {
              this.$listeners.change({
                current: current,
                pageSize: pageSize || pagination.pageSize,
                total: pagination.total
              })
            }
          "
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CommonPageTable',
  props: {
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
  },
  data() {
    return {
      selfForm: {},
      rowSelectionOptionsPagation: {},
      form: this.$form.createForm(this),
      formSpan: 8,
      emptyFormSpanNum: 0,
      spanNum: 3,
      isExpanded: false
    }
  },
  computed: {
    // columns
    customColumns() {
      // 给所有项目都加上slot
      return (this.columns || []).map(slotItem => {
        if (!slotItem.ellipsis) {
          slotItem.ellipsis = {
            type: 'one'
          }
        }
        if (slotItem.scopedSlots && slotItem.scopedSlots.customRender) {
          slotItem.customCustomRender = true
        } else {
          slotItem.customCustomRender = false
          if (!slotItem.scopedSlots) {
            slotItem.scopedSlots = {}
          }
          slotItem.scopedSlots.customRender = slotItem.key
        }
        return slotItem
      })
    }
  },
  watch: {
    selfForm: {
      handler(val) {
        this.$emit('Formchange', val)
        this.$emit('input', val)
      },
      deep: true
    },
    value() {
      this.selfForm = Object.keys(this.value).length
        ? this.value
        : this.searchData
    }
  },
  created() {
    this.selfForm = Object.keys(this.value).length
      ? this.value
      : this.searchData
  },
  mounted() {
    const that = this
    this.$nextTick(() => {
      this.setSpan()
      window.onresize = function() {
        that.setSpan()
      }
    })
  },
  methods: {
    reset() {
      this.$set(this, 'selfForm', {})
      this.form.resetFields()
    },
    widthFilter(row, slotItem) {
      // row.children
      let width = (slotItem.width + '').replace('px', '')
      if (width.indexOf('%') !== -1) {
        return width
      }
      if (width && row.children) {
        width -= 60
      }
      return width ? width + 'px' : 'auto'
    },
    emitEmpty(prop) {
      this.selfForm[prop] = ''
    },
    handleSelectChange() {},
    setSpan() {
      const screenWidthNative = 1136
      let screenWidth = 1136
      const dom = document.querySelector('.pageTable-wrapper-wrapper')
      if (dom) {
        if (typeof dom.clientWidth === 'number') {
          screenWidth = dom.clientWidth
        } else {
          screenWidth = screenWidthNative
        }
      }
      let span = 8
      let spanNum = 3
      if (screenWidth <= 1136) {
        span = 8
        spanNum = 3
      } else {
        span = 6
        spanNum = 4
      }
      // 当小于一横的数量时
      // if (this.searchList.lenght < spanNum) {
      // }
      this.emptyFormSpanNum = spanNum - (this.searchList.length % spanNum) - 1
      this.spanNum = spanNum
      if (!this.searchBtn.length) {
        this.emptyFormSpanNum = 0
      }
      this.formSpan = span
    },
    handleExpand() {
      this.isExpanded = !this.isExpanded
    }
  }
}
</script>

<style>
.pageTable-wrapper-wrapper {
  background: #fff;
  border-radius: 4px;
  padding: 24px;
}
.filter-wraper,
.opera-wrapper {
}
.rightBtns {
  float: right;
}
.rightBtns.btn-group:not(:last-child){
      margin-left: 20px;
    }
.leftBtns {
  float: left;
  padding-top: 2.5px;
  }
.leftBtns.btn-group{
    margin: 0px !important;
}
.leftBtns.btn-group:not(:first-child){
      margin-left: 16px !important;
    }

.pagination-wrapper {
  padding: 20px;
  text-align: right;
}
.components-input-demo-presuffix .anticon-close-circle {
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
  font-size: 12px;
}
.components-input-demo-presuffix .anticon-close-circle:hover {
  color: #999;
}
.components-input-demo-presuffix .anticon-close-circle:active {
  color: #666;
}
.ant-input-affix-wrapper .anticon-close-circle svg{
      color: #ccc;
}
</style>
<style >

.ant-form-vertical .form-item-align {
    vertical-align: middle;
    display: flex;
    align-items: center;
  }
.ant-form-vertical .form-item-align  .ant-form-item-label {
      padding: 0 !important;
    }
.form-item-wrapper {
  display: flex;
}
.form-item-wrapper > label {
    padding-right: 16px;
  }
.form-item-wrapper > div {
    flex: 1;
}
.CommonPageTable__wrapper--tooltip .ant-tooltip-inner {
        background-color: #fff;
        color: #666;
      }
.CommonPageTable__wrapper--tooltip .ant-tooltip-arrow {
        border-top-color: #fff;
      }
</style>
