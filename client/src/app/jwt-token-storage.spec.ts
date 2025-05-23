import { TestBed } from '@angular/core/testing';

import { JwtTokenStorage } from './jwt-token-storage';

describe(JwtTokenStorage.name, () => {
  function setup() {
    const localStorageGetItemSpy = spyOn(Storage.prototype, 'getItem');
    localStorageGetItemSpy.and.returnValue(null);
    TestBed.configureTestingModule({});
    const jwtTokenStorage = TestBed.inject(JwtTokenStorage);

    return { localStorageGetItemSpy, jwtTokenStorage };
  }

  it('should return a token if one is saved', () => {
    const { localStorageGetItemSpy, jwtTokenStorage } = setup();
    localStorageGetItemSpy.and.returnValue('foo');

    const result = jwtTokenStorage.get();

    expect(result).toBe('foo');
    expect(localStorageGetItemSpy).toHaveBeenCalledOnceWith('token');
  });

  it('should return no token if none is saved', () => {
    const { jwtTokenStorage } = setup();
    const result = jwtTokenStorage.get();

    expect(result).toBeNull();
  });

  it('should save a token', () => {
    const { jwtTokenStorage } = setup();
    spyOn(Storage.prototype, 'setItem');

    jwtTokenStorage.save('foo');

    expect(Storage.prototype.setItem).toHaveBeenCalledOnceWith('token', 'foo');
  });

  it('should remove a token', () => {
    const { jwtTokenStorage } = setup();
    spyOn(Storage.prototype, 'removeItem');

    jwtTokenStorage.clear();

    expect(Storage.prototype.removeItem).toHaveBeenCalledOnceWith('token');
  });
});
