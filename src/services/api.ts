// Mock API Wrapper
// Simulates an Axios instance to interact with our mock data and localStorage

const DELAY_MIN = 200;
const DELAY_MAX = 500;

function simulateDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN + 1)) + DELAY_MIN;
  return new Promise(resolve => setTimeout(resolve, delay));
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
}

export const api = {
  get: async <T = any>(url: string, config: any = {}): Promise<ApiResponse<T>> => {
    await simulateDelay();
    return mockRouter<T>('GET', url, null, config);
  },
  post: async <T = any>(url: string, data?: any, config: any = {}): Promise<ApiResponse<T>> => {
    await simulateDelay();
    return mockRouter<T>('POST', url, data, config);
  },
  put: async <T = any>(url: string, data?: any, config: any = {}): Promise<ApiResponse<T>> => {
    await simulateDelay();
    return mockRouter<T>('PUT', url, data, config);
  },
  delete: async <T = any>(url: string, config: any = {}): Promise<ApiResponse<T>> => {
    await simulateDelay();
    return mockRouter<T>('DELETE', url, null, config);
  }
};

// Simplified router to dispatch mock requests
function mockRouter<T>(method: string, url: string, data: any, config: any): ApiResponse<T> {
  console.log(`[Mock API] ${method} ${url}`, data || '');
  return { 
    data: { success: true, message: "Mocked response" } as any,
    status: 200
  };
}
