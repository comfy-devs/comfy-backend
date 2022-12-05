type KeysOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V? P: never]: string
};