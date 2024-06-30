package filedb

import (
	"sync"
)

type LockManager interface {
	Lock(key interface{})
	Unlock(key interface{})
}

type lockManager struct {
	locks map[interface{}]*sync.Mutex
}

func NewLockManager() LockManager {
	return &lockManager{locks: make(map[interface{}]*sync.Mutex)}
}

func (lock *lockManager) Lock(key interface{}) {
	if lock.locks == nil {
		lock.locks = make(map[interface{}]*sync.Mutex)
	}
	l, ok := lock.locks[key]
	if !ok {
		lock.locks[key] = &sync.Mutex{}
	}
	l.Lock()
}

func (lock *lockManager) Unlock(key interface{}) {
	if lock.locks == nil {
		lock.locks = make(map[interface{}]*sync.Mutex)
	}
	l, ok := lock.locks[key]
	if ok {
		l.Unlock()
		delete(lock.locks, key)
	}
}
