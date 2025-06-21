package caching

import "sync"

type SimpleCache[T any] struct {
	value T
	set   bool
	mu    sync.RWMutex
}

func NewSimpleCache[T any]() *SimpleCache[T] {
	return &SimpleCache[T]{}
}

func (c *SimpleCache[T]) Set(value T) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.value = value
	c.set = true
}

func (c *SimpleCache[T]) Get() (T, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.value, c.set
}

func (c *SimpleCache[T]) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	var zero T
	c.value = zero
	c.set = false
}

func (c *SimpleCache[T]) Has() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.set
}
