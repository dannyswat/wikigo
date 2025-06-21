package caching

import "sync"

type Cache[T any] struct {
	data map[string]T
	mu   sync.RWMutex
}

func NewCache[T any]() *Cache[T] {
	return &Cache[T]{
		data: make(map[string]T),
	}
}

func (c *Cache[T]) Set(key string, value T) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data[key] = value
}
func (c *Cache[T]) Get(key string) (T, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	var zero T
	value, exists := c.data[key]
	if !exists {
		return zero, false
	}
	return value, true
}
func (c *Cache[T]) Delete(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.data, key)
}
func (c *Cache[T]) Clear() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.data = make(map[string]T)
}
func (c *Cache[T]) Keys() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	keys := make([]string, 0, len(c.data))
	for key := range c.data {
		keys = append(keys, key)
	}
	return keys
}
func (c *Cache[T]) Values() []T {
	c.mu.RLock()
	defer c.mu.RUnlock()
	values := make([]T, 0, len(c.data))
	for _, value := range c.data {
		values = append(values, value)
	}
	return values
}
func (c *Cache[T]) Len() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.data)
}
func (c *Cache[T]) Has(key string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	_, exists := c.data[key]
	return exists
}
