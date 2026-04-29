import { Public } from './public.decorator';

describe('Public Decorator', () => {
  it('should set isPublic metadata to true', () => {
    class TestClass {
      @Public()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata('isPublic', TestClass.prototype.testMethod);
    expect(metadata).toBe(true);
  });

  it('should work on multiple methods', () => {
    class TestClass {
      @Public()
      method1() {}

      @Public()
      method2() {}
    }

    const metadata1 = Reflect.getMetadata('isPublic', TestClass.prototype.method1);
    const metadata2 = Reflect.getMetadata('isPublic', TestClass.prototype.method2);

    expect(metadata1).toBe(true);
    expect(metadata2).toBe(true);
  });
});
