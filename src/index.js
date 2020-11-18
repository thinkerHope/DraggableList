// Original: https://github.com/chenglou/react-motion/tree/master/demos/demo8-draggable-list

import { render } from 'react-dom'
import React, { useRef } from 'react'
import clamp from 'lodash-es/clamp'
import swap from 'lodash-move'
import { useDrag, addV } from 'react-use-gesture'
import { useSprings, animated } from 'react-spring'
import randomColor from 'randomcolor'
import './styles.css'

const width = 87
const height = 87
const col = 4 
const index2Pos = index => [(index % col) * width, ~~(index / col) * height]
const pos2Index = ([x, y]) => x * col + y

const fn = (order, down, originalIndex, curIndex, x, y) => index => 
  index === originalIndex && down ?
   {
    xy: addV(index2Pos(curIndex), [x, y]),
    zIndex: '1',
    shadow: 15,
    scale: 1.1,
    immediate: key => key === 'zIndex' || key === 'xy'
   } : 
   {
    xy: index2Pos(order.indexOf(index)),
    zIndex: '0',
    shadow: 1,
    scale: 1,
    immediate: false
   }

function DraggableList({ items }) {
  const order = useRef(items.map((_, i) => i))
  const colors = randomColor({luminosity: 'dark', count: items.length})
  const [springs, setSprings] = useSprings(items.length, fn(order.current))
  const bind = useDrag(({ args: [originalIndex], movement: [x, y], down }) => {
    let curIndex = order.current.indexOf(originalIndex)
    let curPos = [
      clamp(Math.round((~~(curIndex / col) * height + y) / height), 0, items.length - 1),
      clamp(Math.round(((curIndex % col) * width + x) / width) , 0, col)
    ]
    let nextIndex = pos2Index(curPos)
    let newOrder = swap(order.current, curIndex, nextIndex)
    setSprings(fn(newOrder, down, originalIndex, curIndex, x, y))
    if (!down) order.current = newOrder
  })


  return (
    <div className="content"> 
      {springs.map(({ xy, zIndex, shadow, scale }, i) => (
        <animated.div 
          {...bind(i)}
          key={i}
          style={{
            backgroundColor: colors[i],
            transform: xy.to((x, y) => `translateX(${x}px) translateY(${y}px)`),
            boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
            zIndex,
            scale
          }}
          children={items[i]}
        />
      ))}
    </div>
  )
}

render(
  <DraggableList items={'1 2 3 4 5 6 7 8 9 10 11 12 13'.split(' ')} />, 
  document.getElementById('root')
)
