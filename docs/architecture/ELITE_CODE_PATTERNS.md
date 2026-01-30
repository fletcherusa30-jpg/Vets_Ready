# 💎 ELITE CODE QUALITY RECOMMENDATIONS
## rallyforge Platform - Specific Implementation Guidelines

---

## 1. TYPE SAFETY PATTERNS

### Pattern 1A: Strict Null Checking
**Problem**: Function receives optional data without checking
```typescript
// ❌ WRONG - will crash if response.data is null
function processMOS(response: APIResponse) {
  const careers = response.data.careers;  // Type error if data is null
  return careers.map(c => c.title);
}
```

**Elite Solution**:
```typescript
// ✅ CORRECT - explicit null safety
function processMOS(response: APIResponse<MOSData>): string[] {
  if (!response.data) {
    throw new rallyforgeError('MISSING_DATA', 400, 'No MOS data returned');
  }

  return response.data.careers?.map(c => c.title) ?? [];
}

// Or with optional chaining (safer)
function getCareers(data: MOSData | undefined): Career[] {
  return data?.careers ?? [];
}
```

### Pattern 1B: Discriminated Unions for Results
**Problem**: Function returns success/error mixed, caller forgets to check
```typescript
// ❌ WRONG - easy to forget success check
async function translateMOS(code: string) {
  try {
    const response = await api.post('/mos', { code });
    return response.data;  // Could be error object
  } catch (error) {
    return error;
  }
}
```

**Elite Solution**:
```typescript
// ✅ CORRECT - type-safe result pattern
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function translateMOS(code: string): Promise<Result<Career[]>> {
  try {
    const response = await api.post<Career[]>('/mos', { code });
    return { success: true, data: response.data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err };
  }
}

// Usage forces handling both cases
const result = await translateMOS('11B');
if (result.success) {
  console.log(result.data);  // Careers array
} else {
  console.error(result.error.message);
}
```

### Pattern 1C: Branded Types for Domain Values
**Problem**: Easy to mix up MOS codes with other strings
```typescript
// ❌ WRONG - MOS code and other strings are the same type
function translateMOS(mosCode: string) {
  // What if someone passes a Social Security Number by mistake?
  return lookupMOS(mosCode);
}
```

**Elite Solution**:
```typescript
// ✅ CORRECT - branded types prevent mistakes
type MOSCode = string & { readonly __brand: 'MOSCode' };
type SSN = string & { readonly __brand: 'SSN' };

// Helper functions to create branded types
const createMOSCode = (code: string): MOSCode => {
  if (!mosMap.has(code)) {
    throw new Error(`Invalid MOS code: ${code}`);
  }
  return code as MOSCode;
};

// Now this is type-safe
function translateMOS(mosCode: MOSCode) {
  return lookupMOS(mosCode);  // Can only pass valid MOS codes
}
```

---

## 2. STATE MANAGEMENT BEST PRACTICES

### Pattern 2A: Zustand Store with TypeScript
**Problem**: Unclear what state is where
```typescript
// ❌ WRONG - mixed concerns, no typing
const useStore = create(() => ({
  theme: 'light',
  user: null,
  notification: null,
  setTheme: (t) => { /* ... */ },
  setUser: (u) => { /* ... */ },
}));
```

**Elite Solution**:
```typescript
// ✅ CORRECT - separated concerns, fully typed
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modal: { type: string; data?: unknown } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

interface NotificationState {
  notifications: Notification[];
}

type AppState = UIState & AuthState & NotificationState & {
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
};

const useStore = create<AppState>((set) => ({
  // UI State
  theme: 'light',
  sidebarOpen: true,
  modal: null,
  setTheme: (theme) => set({ theme }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  openModal: (type, data) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: null }),

  // Auth State
  user: null,
  isAuthenticated: false,
  token: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
}));

// Selectors (prevent unnecessary re-renders)
export const useTheme = () => useStore((state) => state.theme);
export const useUser = () => useStore((state) => state.user);
export const useNotifications = () => useStore((state) => state.notifications);
```

### Pattern 2B: React Query Caching Strategy
**Problem**: Data fetching scattered, no cache invalidation
```typescript
// ❌ WRONG - repetitive, no cache management
function EmploymentPage() {
  const [careers, setCareers] = useState([]);

  useEffect(() => {
    api.get('/careers').then(r => setCareers(r.data));
  }, []);
}
```

**Elite Solution**:
```typescript
// ✅ CORRECT - centralized, cached, invalidation
// src/hooks/useEmployment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useEmploymentCareers(mosCode: string) {
  return useQuery({
    queryKey: ['employment', 'careers', mosCode],  // Cache key
    queryFn: () => api.get(`/employment/careers/${mosCode}`),
    staleTime: 1000 * 60 * 5,  // 5 minutes
    retry: 2,
    select: (data) => data.data,  // Transform response
  });
}

export function useTranslateMOS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mosCode: string) =>
      api.post('/employment/translate-mos', { mosCode }),
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(
        ['employment', 'careers', data.mosCode],
        data.careers
      );
    },
    onError: (error) => {
      // Show error notification
      showNotification({ type: 'error', message: error.message });
    },
  });
}

// Usage in component
function EmploymentPage() {
  const { data: careers, isLoading, error } = useEmploymentCareers('11B');
  const { mutate: translateMOS } = useTranslateMOS();

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return <CareersList careers={careers} />;
}
```

---

## 3. ERROR HANDLING ARCHITECTURE

### Pattern 3A: Unified Error Types
```typescript
// ✅ CORRECT - consistent error handling
export class rallyforgeError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public userMessage: string,
    public timestamp: Date = new Date(),
    public details?: Record<string, any>
  ) {
    super(userMessage);
    this.name = 'rallyforgeError';
  }
}

export class ValidationError extends rallyforgeError {
  constructor(public field: string, message: string) {
    super('VALIDATION_ERROR', 400, message);
  }
}

export class NotFoundError extends rallyforgeError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', 404, `${resource} with ID ${id} not found`);
  }
}

export class UnauthorizedError extends rallyforgeError {
  constructor() {
    super('UNAUTHORIZED', 401, 'Authentication required');
  }
}

// Usage
try {
  const mos = await getMOS(mosCode);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    showFieldError(error.field, error.userMessage);
  } else if (error instanceof NotFoundError) {
    // Handle not found
    showNotification({ type: 'error', message: 'MOS code not found' });
  } else if (error instanceof UnauthorizedError) {
    // Redirect to login
    redirect('/login');
  } else {
    // Generic error
    showNotification({ type: 'error', message: 'An error occurred' });
  }
}
```

### Pattern 3B: Error Boundary Components
```typescript
// ✅ CORRECT - catch React render errors
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    this.props.onError?.(error);

    // Log to monitoring service
    logErrorToService({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date(),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee', borderRadius: '4px' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary onError={(error) => logToSentry(error)}>
  <EmploymentPage />
</ErrorBoundary>
```

---

## 4. COMPONENT ARCHITECTURE

### Pattern 4A: Compound Component Pattern
**Problem**: Props drilling gets complex with dependent features
```typescript
// ❌ WRONG - props drilling nightmare
function EmploymentForm({
  onSubmit,
  onBranchChange,
  onMosChange,
  branches,
  mosCodes,
  selectedBranch,
  selectedMos,
}) {
  // 7 props to keep track of...
}
```

**Elite Solution**:
```typescript
// ✅ CORRECT - compound components
interface BranchSelectorContextType {
  selectedBranch: string;
  onBranchChange: (branch: string) => void;
  branches: Branch[];
}

const BranchSelectorContext = createContext<BranchSelectorContextType | undefined>(undefined);

export function BranchSelector({ children, branches, onChange }: Props) {
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const handleChange = (branch: string) => {
    setSelectedBranch(branch);
    onChange?.(branch);
  };

  return (
    <BranchSelectorContext.Provider
      value={{ selectedBranch, onBranchChange: handleChange, branches }}
    >
      {children}
    </BranchSelectorContext.Provider>
  );
}

export function BranchSelector.Label({ children }: Props) {
  return <label style={{ display: 'block', marginBottom: '8px' }}>{children}</label>;
}

export function BranchSelector.Button() {
  const { selectedBranch, onBranchChange } = useBranchSelector();
  return (
    <button onClick={() => {/* open dropdown */}}>
      {selectedBranch || 'Select branch'}
    </button>
  );
}

export function BranchSelector.Options() {
  const { branches, onBranchChange } = useBranchSelector();
  return (
    <div>
      {branches.map(branch => (
        <div
          key={branch}
          onClick={() => onBranchChange(branch)}
        >
          {branch}
        </div>
      ))}
    </div>
  );
}

function useBranchSelector() {
  const context = useContext(BranchSelectorContext);
  if (!context) {
    throw new Error('useBranchSelector must be used within BranchSelector');
  }
  return context;
}

// Usage - much cleaner
<BranchSelector branches={branches} onChange={onBranchChange}>
  <BranchSelector.Label>Military Branch</BranchSelector.Label>
  <BranchSelector.Button />
  <BranchSelector.Options />
</BranchSelector>
```

### Pattern 4B: Controlled vs. Uncontrolled Components
```typescript
// ✅ CORRECT - flexible component
interface SelectProps {
  value?: string;  // Controlled
  defaultValue?: string;  // Uncontrolled
  onChange?: (value: string) => void;
  options: string[];
}

export function Select({
  value: controlledValue,
  defaultValue = '',
  onChange,
  options,
}: SelectProps) {
  // Support both controlled and uncontrolled modes
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <select value={value} onChange={(e) => handleChange(e.target.value)}>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
```

---

## 5. API CLIENT BEST PRACTICES

### Pattern 5A: Type-Safe API Client
```typescript
// ✅ CORRECT - fully typed API operations
interface APIConfig {
  baseURL: string;
  timeout: number;
  retry: number;
}

class APIClient {
  private client: AxiosInstance;

  constructor(config: APIConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
    });

    // Add request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  async post<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T, D = unknown>(url: string, data?: D): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T = void>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

// Usage
const apiClient = new APIClient({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  retry: 3,
});

export const employmentApi = {
  translateMOS: (code: string) =>
    apiClient.post<Career[]>('/employment/translate-mos', { mosCode: code }),

  getCareers: (mosCode: string) =>
    apiClient.get<Career[]>(`/employment/careers/${mosCode}`),
};
```

---

## 6. VALIDATION BEST PRACTICES

### Pattern 6A: Zod Schema Validation
```typescript
// ✅ CORRECT - runtime validation with TypeScript inference
import { z } from 'zod';

// Define schema
const MOSTranslationSchema = z.object({
  mosCode: z.string().length(3, 'MOS code must be 3 characters').toUpperCase(),
  branch: z.enum(['Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force']),
  yearsOfService: z.number().int().min(0).max(40),
});

type MOSTranslation = z.infer<typeof MOSTranslationSchema>;

// Validate runtime data
function processMOSInput(data: unknown): MOSTranslation {
  try {
    return MOSTranslationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        error.errors[0].path.join('.'),
        error.errors[0].message
      );
    }
    throw error;
  }
}

// API integration
app.post('/employment/translate-mos', async (req, res) => {
  const validatedData = processMOSInput(req.body);
  // validatedData is fully typed as MOSTranslation
  const result = await translateMOS(validatedData);
  res.json(result);
});
```

---

## 7. PERFORMANCE PATTERNS

### Pattern 7A: Memoization Strategy
```typescript
// ✅ CORRECT - prevent unnecessary re-renders
interface CareerListProps {
  careers: Career[];
  onSelect: (career: Career) => void;
}

export const CareerList = memo(function CareerList({
  careers,
  onSelect,
}: CareerListProps) {
  return (
    <div>
      {careers.map(career => (
        <CareerItem
          key={career.id}
          career={career}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
});

// Memoize callback to prevent child re-renders
function EmploymentPage() {
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const handleSelectCareer = useCallback((career: Career) => {
    setSelectedCareer(career);
  }, []);  // No dependencies, function never recreated

  return (
    <CareerList careers={careers} onSelect={handleSelectCareer} />
  );
}
```

---

## IMPLEMENTATION PRIORITY

1. **Type Safety** (Patterns 1A-1C) - Start immediately
2. **State Management** (Patterns 2A-2B) - After type safety
3. **Error Handling** (Patterns 3A-3B) - While fixing types
4. **Component Architecture** (Patterns 4A-4B) - Refactor existing components
5. **API Client** (Pattern 5A) - Consolidate API calls
6. **Validation** (Pattern 6A) - Protect all inputs
7. **Performance** (Pattern 7A) - Measure, then optimize

**Estimated Timeline**: 3-4 weeks for full implementation

---

*Created: January 26, 2026*
*For: rallyforge Elite Code Standards*

