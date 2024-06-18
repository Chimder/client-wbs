import Axios, { AxiosError, AxiosRequestConfig } from 'axios'

// const url = process.env.NEXT_PUBLIC_API
export const AXIOS_INSTANCE = Axios.create({
  baseURL: 'http://localhost:4000',
  // baseURL: url?.toString(),
  headers: {
    'Content-Type': 'application/json',
  },
}) // use your own URL here or environment variable

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  // const source = Axios.CancelToken.source();
  return AXIOS_INSTANCE({
    ...config,
    ...options,
    // cancelToken: source.token,
  }).then(({ data }) => data)

  // @ts-ignore
  // promise.cancel = () => {
  //   source.cancel("Query was cancelled");
  // };

  // return promise;
}

export type ErrorType<Error> = AxiosError<Error>

export type BodyType<Data> = Data
