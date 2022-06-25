/**
 * 公共代码
 */
function createApp(rootComponent) {
  return {
    // 挂载对象
    mount(selector) {
      // 获取挂载容器
      const container = document.querySelector(selector)
      // 是否已经挂载的标识
      let isMounted = false
      // 旧节点的标识
      let oldVNode = null

      // 当数据改变时需要自动更新模板
      watchEffect(function () {
        if (!isMounted) { // 还未挂载
          // 执行组件中的render()生成VNode，并且保存该节点
          oldVNode = rootComponent.render()
          // 将VNode挂载到容器中
          mount(oldVNode, container)
          // 更改挂载标识
          isMounted = true
        } else { // 已经挂载
          // 执行组件中的render()生成新的VNode
          const newVNode = rootComponent.render()
          // 更新节点
          patch(oldVNode,newVNode)
          // 更换旧节点
          oldVNode = newVNode
        }
      })
    }
  }
}