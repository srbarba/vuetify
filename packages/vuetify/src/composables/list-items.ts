// Utilities
import { computed } from 'vue'
import { deepEqual, getPropertyFromItem, pick, propsFactory } from '@/util'

// Types
import type { PropType, Ref } from 'vue'
import type { SelectItemKey } from '@/util'

export interface ListItem<T = any> {
  title: string
  value: any
  props: {
    [key: string]: any
    title: string
    value: any
  }
  children?: ListItem<T>[]
  raw: T
}

export interface ItemProps<T = any> {
  items: T[]
  itemTitle: SelectItemKey
  itemValue: SelectItemKey
  itemChildren: SelectItemKey
  itemProps: SelectItemKey
  itemType: SelectItemKey
  returnObject: boolean
}

// Composables
export const makeItemsProps = propsFactory({
  items: {
    type: Array as PropType<ItemProps<any>['items']>,
    default: () => ([]),
  },
  itemTitle: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'title',
  },
  itemValue: {
    type: [String, Array, Function] as PropType<SelectItemKey>,
    default: 'value',
  },
  itemChildren: {
    type: [Boolean, String, Array, Function] as PropType<SelectItemKey>,
    default: 'children',
  },
  itemProps: {
    type: [Boolean, String, Array, Function] as PropType<SelectItemKey>,
    default: 'props',
  },
  itemType: {
    type: [Boolean, String, Array, Function] as PropType<SelectItemKey>,
    default: 'type',
  },
  returnObject: Boolean,
}, 'list-items')

export function transformItem (props: Omit<ItemProps, 'items'>, item: any): ListItem {
  const title = getPropertyFromItem(item, props.itemTitle, item)
  const value = props.returnObject ? item : getPropertyFromItem(item, props.itemValue, title)
  const children = getPropertyFromItem(item, props.itemChildren)
  const itemProps = props.itemProps === true
    ? typeof item === 'object' && item != null && !Array.isArray(item)
      ? 'children' in item
        ? pick(item as any, ['children'])[1]
        : item
      : undefined
    : getPropertyFromItem(item, props.itemProps)

  const _props = {
    title,
    value,
    ...itemProps,
  }

  return {
    title: String(_props.title ?? ''),
    value: _props.value,
    props: _props,
    children: Array.isArray(children) ? transformItems(props, children) : undefined,
    raw: item,
  }
}

export function transformItems (props: Omit<ItemProps, 'items'>, items: ItemProps['items']) {
  const array: ListItem[] = []

  for (const item of items) {
    array.push(transformItem(props, item))
  }

  return array
}

export function useItems <T> (props: ItemProps<T>) {
  const items = computed(() => transformItems(props, props.items))

  return useTransformItems(items, value => transformItem(props, value))
}

export function useTransformItems <T extends { value: unknown }> (items: Ref<T[]>, transform: (value: unknown) => T) {
  function transformIn (value: any[]): T[] {
    return value
      // When the model value is null, returns an InternalItem based on null
      // only if null is one of the items
      .filter(v => v !== null || items.value.some(item => item.value === null))
      .map(v => {
        const existingItem = items.value.find(item => deepEqual(v, item.value))
        // Nullish existingItem means value is a custom input value from combobox
        // In this case, use transformItem to create an InternalItem based on value
        return existingItem ?? transform(v)
      })
  }

  function transformOut (value: T[]) {
    return value.map(({ value }) => value)
  }

  return { items, transformIn, transformOut }
}

type FlatListItem = { type: 'divider' } | { type: 'item', item: ListItem } | { type: 'subheader', item: ListItem }

export function flatten (items: ListItem[]): FlatListItem[] {
  const arr = []

  for (const item of items) {
    if (item.children?.length) {
      arr.push({ type: 'subheader' as const, item })
      arr.push(...flatten(item.children))
    } else {
      arr.push({ type: 'item' as const, item })
    }

    if (item.props.divider) {
      arr.push({ type: 'divider' as const })
    }
  }

  return arr
}
