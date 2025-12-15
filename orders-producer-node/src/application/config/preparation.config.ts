import { PreparationTimeCalculator, ExactNameStrategy } from "../../domain/strategies";
import { PreparationTimeRepository } from "../../infrastructure/database/repositories/preparation-time.repository";

/**
 * Crea el calculador de tiempos de preparación cargando desde MongoDB.
 * Si MongoDB no está disponible o no hay datos, usa valores por defecto.
 */
export async function createCalculatorFromMongo(): Promise<PreparationTimeCalculator> {
  const calc = new PreparationTimeCalculator();
  const repo = new PreparationTimeRepository();

  try {
    const preparationTimes = await repo.getAllEnabled();

    if (preparationTimes.length > 0) {
      console.log(`📊 Cargando ${preparationTimes.length} tiempos de preparación desde MongoDB`);
      
      for (const pt of preparationTimes) {
        calc.register(new ExactNameStrategy(pt.productName, pt.secondsPerUnit));
        console.log(`  ✓ ${pt.productName}: ${pt.secondsPerUnit}s por unidad`);
      }

      return calc;
    } else {
      console.log("[-] No se encontraron tiempos de preparación en MongoDB, usando valores por defecto");
    }
  } catch (error) {
    console.warn("[-]  Error cargando tiempos desde MongoDB, usando valores por defecto:", error);
  }

  // Fallback: valores por defecto si MongoDB no está disponible o está vacío
  console.log("📋 Usando configuración por defecto hardcodeada");
  calc.register(new ExactNameStrategy("Hamburguesa", 10));
  calc.register(new ExactNameStrategy("Pizza", 15));
  calc.register(new ExactNameStrategy("Ensalada", 5));
  
  return calc;
}
