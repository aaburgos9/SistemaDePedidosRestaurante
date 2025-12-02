import { retryWithBackoff } from '../../src/utils/retryLogic';

// Mock de console.warn para evitar ruido en los tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

describe('retryWithBackoff', () => {
  // ✅ IMPORTANTE: NO usar fake timers, causan problemas con async/await
  // El retryLogic ya es rápido en tests (delay mínimo 1s)
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe ejecutar la función exitosamente en el primer intento', async () => {
    // Arrange
    const mockFn = jest.fn().mockResolvedValue('success');

    // Act
    const result = await retryWithBackoff(mockFn, 3);

    // Assert
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('debe reintentar cuando falla y tener éxito en el segundo intento', async () => {
    // Arrange
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First fail'))
      .mockResolvedValueOnce('success');

    // Act
    const result = await retryWithBackoff(mockFn, 3);

    // Assert
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(2);
  }, 10000); // ✅ Timeout más largo porque hay delays reales

  it('debe lanzar error después de agotar todos los intentos', async () => {
    // Arrange
    const error = new Error('Persistent failure');
    const mockFn = jest.fn().mockRejectedValue(error);

    // Act & Assert
    await expect(retryWithBackoff(mockFn, 3)).rejects.toThrow('Persistent failure');
    expect(mockFn).toHaveBeenCalledTimes(3);
  }, 15000); // ✅ Timeout más largo

  it('debe aplicar backoff exponencial entre reintentos', async () => {
    // Arrange
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValueOnce('success');

    const startTime = Date.now();

    // Act
    const result = await retryWithBackoff(mockFn, 3);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
    
    // ✅ Verificar que hubo delays (1s + 2s = ~3000ms mínimo)
    expect(duration).toBeGreaterThanOrEqual(2900); // Margen de error
  }, 10000);

  it('debe usar el número de intentos personalizados', async () => {
    // Arrange
    const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));

    // Act & Assert
    await expect(retryWithBackoff(mockFn, 5)).rejects.toThrow('Always fails');
    expect(mockFn).toHaveBeenCalledTimes(5);
  }, 20000); // ✅ 5 intentos = más tiempo
});