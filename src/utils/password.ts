export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 12,
  });
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await Bun.password.verify(password, hashedPassword);
}