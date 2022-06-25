/**
 * 渲染模块：h() mount() patch() 
 */
const h = (tag, props, children) => {
  return {
    tag, props, children
  }
}

const mount = (vnode, container) => {
  // 1、创建元素
  const el = vnode.el = document.createElement(vnode.tag)

  // 2、处理props
  if (vnode.props) {
    // 取出所有的props
    for (const key in vnode.props) {
      const value = vnode.props[key]

      if (key.startsWith('on')) { // 如果props传入的是一个事件，则绑定在元素上
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else { // 如果传入的是一个属性对象，则将属性绑定在元素上
        el.setAttribute(key, value)
      }
    }
  }

  // 3、处理children
  if (vnode.children) {
    // 当vnode的children为字符串，直接将其设计为容器的内容
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      // 当vnode.children为多个h()函数生成的vnode，则递归调用挂载函数
      vnode.children.forEach(child => {
        mount(child, el)
      });
    }
  }

  // 4、挂载
  container.appendChild(el)
}

const patch = (vnode1, vnode2) => {

  if (vnode1.tag != vnode2.tag) { // 当两个节点的类型都不同的时候
    // 直接从旧节点的父节点中将旧的节点移除，再挂载上新的节点
    const n1Parent = vnode1.el.parentElement
    n1Parent.removeChild(vnode1.el)
    mount(vnode2, n1Parent)

  } else { // 当两个节点类型相同时
    // 1、取出旧节点的元素，并且保存于新节点中
    const el = vnode2.el = vnode1.el

    // 2、处理props
    const oldProps = vnode1.props || {}
    const newProps = vnode2.props || {}


    // 2.1、添加新的props
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]

      // 当新旧值不一时，在元素上添加新的props
      if (oldValue !== newValue) {
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }

    // 2.2、移除旧的props
    for (const key in oldProps) {
      // 当旧的key不存在于新的props中，从元素上移除旧的props
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          el.removeEventListener(key.slice(2).toLowerCase())
        } else {
          el.removeAttribute(key)
        }
      }
    }

    // 3、处理children
    const oldChildren = vnode1.children || []
    const newChildren = vnode2.children || []


    if (typeof newChildren === 'string') { // 情况一：当newChildren为字符串时
      if (typeof oldChildren === 'string') { // 当oldChildren也是字符串时，比较二者是否相同
        if (newChildren !== oldChildren) { // 不相同则更新内容
          el.textContent = newChildren
        }
      } else { // 当oldChildren不为字符串时，直接将newChildren的字符串内容在元素中进行替换
        el.innerHTML = newChildren
      }
    } else { // 情况二：当newChildren为数组时
      if (typeof oldChildren === 'string') { // 当oldChildren为字符串时      
        el.innerHTML = '' // 先清空
        newChildren.forEach(item => {
          mount(item, el) // 再将数组中的vnode挂载到元素中
        })
      } else { // 当二者都是数组时
        /**
         * oldChildren:[v1,v2,v3]
         * newChlidren:[v1,v5,v6,v7,v8]
         */
        // 3.1、取得较短数组长度，对前面相同的节点进行patch操作
        const commenLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commenLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // 3.2、当新数组长度比旧数组长，将多出来的那一部分vnode进行挂载
        if (oldChildren.length < newChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        // 3.3、当新数组长度比旧数组短，移除旧节点中多余的vnode
        if (oldChildren.length > newChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}