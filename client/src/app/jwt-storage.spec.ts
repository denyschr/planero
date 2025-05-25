import { TestBed } from '@angular/core/testing';

import { JwtStorage } from './jwt-storage';

describe(JwtStorage.name, () => {
  function setup() {
    const localStorageGetItemSpy = spyOn(Storage.prototype, 'getItem');
    localStorageGetItemSpy.and.returnValue(null);
    TestBed.configureTestingModule({});
    const jwtStorage = TestBed.inject(JwtStorage);

    return { localStorageGetItemSpy, jwtStorage };
  }

  it('should return a token if one is saved', () => {
    const { localStorageGetItemSpy, jwtStorage } = setup();
    localStorageGetItemSpy.and.returnValue('foo');

    const result = jwtStorage.get();

    expect(result).toBe('foo');
    expect(localStorageGetItemSpy).toHaveBeenCalledOnceWith('token');
  });

  it('should return no token if none is saved', () => {
    const { jwtStorage } = setup();
    const result = jwtStorage.get();

    expect(result).toBeNull();
  });

  it('should save a token', () => {
    const { jwtStorage } = setup();
    spyOn(Storage.prototype, 'setItem');

    jwtStorage.save('foo');

    expect(Storage.prototype.setItem).toHaveBeenCalledOnceWith('token', 'foo');
  });

  it('should remove a token', () => {
    const { jwtStorage } = setup();
    spyOn(Storage.prototype, 'removeItem');

    jwtStorage.clear();

    expect(Storage.prototype.removeItem).toHaveBeenCalledOnceWith('token');
  });
});
