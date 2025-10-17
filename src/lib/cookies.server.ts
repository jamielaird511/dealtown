'use server';

import { cookies } from 'next/headers';

export async function setCookie(
  name: string,
  value: string,
  options?: Parameters<ReturnType<typeof cookies>['set']>[2]
) {
  cookies().set(name, value, options);
}

export async function deleteCookie(name: string) {
  cookies().delete(name);
}
