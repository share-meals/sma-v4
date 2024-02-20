import {
  verifyEmailDomain,
  verifySchema,
} from './create';

describe('create', () => {
  it('should not throw an error if passed correct data schema', () => {
    expect(() => {
      verifySchema({
      email: 'me@aol.com',
      name: '1234567890',
      password: '1234567890'
      });
    }).not.toThrow();
  });

  it('should throw an error if passed incorrect data schema', () => {
    expect(() => {
      verifySchema({
      email: 'me@aol.com',
      //name: '1234567890',
      //password: '1234567890'
      });
    }).toThrow();
  });

  
  it('should throw an error if passed an incorrect email address', async () => {
    await expect(verifyEmailDomain('notareal@emaildomainatallzxc.zzz')).rejects.toThrow();
  });

  it('should not throw an error if passed a correct email address', async () => {
    await expect(verifyEmailDomain('me@aol.com')).resolves.not.toThrow();
  });

  // todo: cannot test schema validation currently

  
});
