package filedb

import (
	"sync"
)

type Lock struct {
	locks map[interface{}]*sync.Mutex
}

func (lock *Lock) Lock(key interface{}) {
	if lock.locks == nil {
		lock.locks = make(map[interface{}]*sync.Mutex)
	}
	l, ok := lock.locks[key]
	if !ok {
		lock.locks[key] = &sync.Mutex{}
	}
	l.Lock()
}

func (lock *Lock) Unlock(key interface{}) {
	if lock.locks == nil {
		lock.locks = make(map[interface{}]*sync.Mutex)
	}
	l, ok := lock.locks[key]
	if ok {
		l.Unlock()
		delete(lock.locks, key)
	}
}
