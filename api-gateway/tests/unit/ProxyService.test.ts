import axios from 'axios';
import { OrdersProxyService } from '../../src/services/OrdersProxyService';
import { retryWithBackoff } from '../../src/utils/retryLogic';

// Mock de axios y retryLogic
jest.mock('axios');
jest.mock('../../src/utils/retryLogic');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedRetry = retryWithBackoff as jest.MockedFunction<typeof retryWithBackoff>;

describe('ProxyService', () => {
  let proxyService: OrdersProxyService;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Independent: resetear mocks antes de cada test
    jest.clearAllMocks();

    // Configurar mock de axios instance
    mockAxiosInstance = {
      request: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Mock de retryWithBackoff para ejecutar la función directamente
    mockedRetry.mockImplementation(async (fn: any) => await fn());

    proxyService = new OrdersProxyService();
  });

  describe('forward', () => {
    it('debe enviar petición GET correctamente', async () => {
      // Arrange
      const mockResponse = { data: { id: 1, status: 'ok' }, status: 200 };
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // Act
      const result = await proxyService.forward('/api/v1/orders/1', 'GET');

      // Assert - Self-validating
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v1/orders/1',
        data: undefined,
        headers: {
          'X-Forwarded-For': 'api-gateway',
        },
      });
    });

    it('debe enviar petición POST con datos y headers personalizados', async () => {
      // Arrange
      const mockResponse = { data: { id: 123 }, status: 201 };
      const requestData = { customerName: 'Juan', items: [] };
      const customHeaders = { 'Authorization': 'Bearer token123' };
      
      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      // Act
      const result = await proxyService.forward(
        '/api/v1/orders/',
        'POST',
        requestData,
        customHeaders
      );

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v1/orders/',
        data: requestData,
        headers: {
          'Authorization': 'Bearer token123',
          'X-Forwarded-For': 'api-gateway',
        },
      });
    });

    it('debe convertir método a mayúsculas', async () => {
      // Arrange
      mockAxiosInstance.request.mockResolvedValue({ data: 'ok' });

      // Act
      await proxyService.forward('/test', 'patch');

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('debe agregar header X-Forwarded-For automáticamente', async () => {
      // Arrange
      mockAxiosInstance.request.mockResolvedValue({ data: 'ok' });

      // Act
      await proxyService.forward('/test', 'GET');

      // Assert
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Forwarded-For': 'api-gateway',
          }),
        })
      );
    });

    it('debe usar retryWithBackoff para manejar fallos', async () => {
      // Arrange
      mockAxiosInstance.request.mockResolvedValue({ data: 'ok' });

      // Act
      await proxyService.forward('/test', 'GET');

      // Assert - verifica que retryWithBackoff fue llamado
      expect(mockedRetry).toHaveBeenCalledTimes(1);
      expect(mockedRetry).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('getServiceName', () => {
    it('debe retornar el nombre del servicio', () => {
      // Act & Assert
      expect(proxyService.getServiceName()).toBe('python-ms');
    });
  });

  describe('getBaseURL', () => {
    it('debe retornar la URL base del servicio', () => {
      // Act
      const baseURL = proxyService.getBaseURL();

      // Assert
      expect(baseURL).toBeDefined();
      expect(typeof baseURL).toBe('string');
    });
  });
});
