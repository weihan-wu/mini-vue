/**
 * 响应式模块
 */

// Part 1 收集依赖的类
class Dep {
  // 设置一个Set()用于搜集依赖
  constructor() {
    this.subscribers = new Set();
  }

  // 编写一个添加依赖的方法(弃用)
  // addEffect(effect) {
  //   this.subscribers.add(effect)
  // }

  // 自动收集依赖
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  // 执行所有依赖函数
  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}


// 用于保留当前添加的effect的标识
let activeEffect = null

// Part 2 为依赖中添加effect
function watchEffect(effect) {
  // 每次添加方法时都进行依赖收集
  activeEffect = effect
  // 全部执行一次进行依赖收集
  effect()
  // 添加完成后需要置空
  activeEffect = null
}


// 创建一个WeakMap用于保存各个对象的依赖
const targetMap = new WeakMap()

// Part 3 获取制定属性依赖的方法，如果没有则创建新的依赖，并且放入依赖合集中
function getDep(target, key) {
  // 获取目标对象的依赖
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 取出目标属性的依赖
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }

  return dep
}

// Part 4 
// 使用Vue2的方式为对象赋予响应式
/**
  function reactive(obj) {
  // 对对象中的每个key进行数据劫持
  Object.keys(obj).forEach(key => {
    // 获取具体属性的依赖与值
    const dep = getDep(obj, key)
    let value = obj[key]
    // 对对象中的每个属性进行数据劫持
    Object.defineProperty(obj, key, {
      get() {
        // 一旦数据被调用则对被调用属性进行数据劫持
        dep.depend()
        return value
      },
      set(newValue) {
        value = newValue
        // 当属性被改变则调用被改变数据依赖的所有方法
        dep.notify()
      }
    })
  })

  return obj
}
*/


// 使用Vue3的方式为对象赋予响应式
function reactive(obj) {
  return new Proxy(obj,{
    get(target,key) {
      const dep = getDep(target,key)
      dep.depend()
      return Reflect.get(target,key)
    },
    set(target,key,newValue) {
      const dep = getDep(target,key)
      Reflect.set(target,key,newValue)
      dep.notify()
    }
  })
}



// 测试数据
const info = reactive({
  counter: 100,
  name: "wuwh"
})
const square = reactive({
    height: 50
})

// 测试代码

watchEffect(function () {
  console.log('Effect1:', info.counter * 2);
})

watchEffect(function () {
  console.log('Effect2:', info.counter * info.counter, info.name);
})

watchEffect(function () {
  console.log('Effect3:', square.height);
})

console.log('改变对象中属性');

// info.counter++
info.name = 'wwh'
square.height = '70'