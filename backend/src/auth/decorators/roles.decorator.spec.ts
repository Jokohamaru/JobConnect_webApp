import { Roles } from './roles.decorator';

describe('Roles Decorator', () => {
  it('should set roles metadata with single role', () => {
    class TestClass {
      @Roles('CANDIDATE')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata('roles', TestClass.prototype.testMethod);
    expect(metadata).toEqual(['CANDIDATE']);
  });

  it('should set roles metadata with multiple roles', () => {
    class TestClass {
      @Roles('CANDIDATE', 'RECRUITER')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata('roles', TestClass.prototype.testMethod);
    expect(metadata).toEqual(['CANDIDATE', 'RECRUITER']);
  });

  it('should work on multiple methods with different roles', () => {
    class TestClass {
      @Roles('CANDIDATE')
      method1() {}

      @Roles('RECRUITER', 'ADMIN')
      method2() {}
    }

    const metadata1 = Reflect.getMetadata('roles', TestClass.prototype.method1);
    const metadata2 = Reflect.getMetadata('roles', TestClass.prototype.method2);

    expect(metadata1).toEqual(['CANDIDATE']);
    expect(metadata2).toEqual(['RECRUITER', 'ADMIN']);
  });

  it('should handle all three roles', () => {
    class TestClass {
      @Roles('CANDIDATE', 'RECRUITER', 'ADMIN')
      testMethod() {}
    }

    const metadata = Reflect.getMetadata('roles', TestClass.prototype.testMethod);
    expect(metadata).toEqual(['CANDIDATE', 'RECRUITER', 'ADMIN']);
  });
});
