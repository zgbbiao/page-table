<template>
  <div class="operate-com">
    <div
      v-for="(item, index) in operates.slice(0, sliceNum)"
      :key="index"
      class="operate-item"
      @click.stop="handleClick(item)"
    >
      <a-tooltip placement="bottomLeft" :auto-adjust-overflow="true">
        <template slot="title">
          <span>{{ item.text }}</span>
        </template>
        <div
          class="operate-icon"
          @mouseenter="showActiveIcon(index)"
          @mouseleave="showDefaultIcon(index)"
        >
          <img :src="icons[item.iconName] ? icons[item.iconName] : item.iconName" alt="" />
        </div>
      </a-tooltip>
    </div>
    <div v-if="operates && operates.length > sliceNum" class="test">
      <a-tooltip
        placement="bottomLeft"
        :auto-adjust-overflow="true"
        :overlay-class-name="'ellipsis-tooltip'"
      >
        <template slot="title">
          <div
            v-for="(item, index) in operates.slice(sliceNum)"
            :key="index"
            class="ellipsis-item"
            @click.stop="handleClick(item)"
          >
            <span>{{ item.text }}</span>
          </div>
        </template>
        <div
          class="operate-icon"
          @mouseenter="showActiveIcon"
          @mouseleave="showDefaultIcon"
        >
          <img
            v-if="ellipssIsActive"
            :src="icons.ellipsisActive"
            alt=""
            style="width: 32px;height: 32px;"
          />
          <img
            v-else
            :src="icons.ellipsis"
            alt=""
            style="width: 32px;height: 32px;"
          />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))
export default {
  props: {
    operateArr: {
      type: [Object, Array],
      required: true
    },
    scope: {
      type: Object,
      required: false,
      default: () => {
        // { index: 1, row: {} }
      }
    },
    sliceNum: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      ellipssIsActive: false, // 省略是否处于active状态
      operates: {},
      icons: {
        copy: require('./images/copy.png'),
        use: require('./images/use.png'),
        delete: require('./images/delete.png'),
        disable: require('./images/disable.png'), // 停用
        enable: require('./images/enable.png'), // 启用
        edit: require('./images/edit.png'),
        editActive: require('./images/editActive.png'),
        ellipsis: require('./images/ellipsis.png'),
        ellipsisActive: require('./images/ellipsisActive.png'),
        publish: require('./images/publish.png'),
        publishActive: require('./images/publishActive.png'),
        usualDelete: require('./images/usualDelete.png'),
        usualDeleteActive: require('./images/usualDeleteActive.png'),
        customize: require('./images/customize.png'),
        customizeActive: require('./images/customizeActive.png'),
        view: require('./images/view.png'),
        viewActive: require('./images/viewActive.png')
      }
    }
  },
  watch: {
    operateArr: {
      handler (newV) {
        this.operates = deepCopy(newV)
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {},
  methods: {
    showActiveIcon(index) {
      if (typeof index !== 'number') {
        this.ellipssIsActive = true
        return
      }
      this.operates[index].iconName =
        this.operates[index].iconName + 'Active'
    },
    showDefaultIcon(index) {
      if (typeof index !== 'number') {
        this.ellipssIsActive = false
        return
      }
      const iconName = this.operates[index].iconName.replace(
        /Active/g,
        ''
      )
      this.operates[index].iconName = iconName
    },
    handleClick(item) {
      this.$emit('click', item, this.scope)
    }
  }
}
</script>
<style>
.ellipsis-tooltip .ant-tooltip-content  .ant-tooltip-arrow {
      display: none;
    }
.ellipsis-tooltip .ant-tooltip-content   .ant-tooltip-inner {
      background-color: #fff;
      color: inherit;
      padding: 6px 0px;
}
.ellipsis-tooltip .ant-tooltip-content   .ant-tooltip-inner .ellipsis-item {
        padding: 8px 16px;
        font-size: 14px;
}
.ellipsis-tooltip .ant-tooltip-content   .ant-tooltip-inner .ellipsis-item:hover {
          background-color: #eceffc;
        }
        
.operate-com {
  display: flex;
}
.operate-com .operate-item{
      cursor: pointer;
      padding: 0 12px;
}
.operate-com .operate-item .operate-icon{
      cursor: pointer;
      padding: 0 12px;
}
.operate-com .operate-item img {
      width: 15px;
      height: 14px;
    }
.ellipsis-item {
  padding: 4px 6px;
  cursor: pointer;
}
.ellipsis-item .ellipsis-icon {
    width: 15px;
    height: 14px;
    vertical-align: text-top;
    margin-right: 6px;
}
</style>
