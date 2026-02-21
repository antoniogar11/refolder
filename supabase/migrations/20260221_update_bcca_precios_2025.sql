-- Update BCCA reference prices to reflect real Spanish market prices 2025/2026
-- Previous prices were based on outdated BCCA values, ~15-30% below current market

-- Demolición
UPDATE precios_referencia SET precio = 8.50 WHERE codigo = 'DEM-001';
UPDATE precios_referencia SET precio = 10.50 WHERE codigo = 'DEM-002';
UPDATE precios_referencia SET precio = 12.00 WHERE codigo = 'DEM-003';
UPDATE precios_referencia SET precio = 11.00 WHERE codigo = 'DEM-004';
UPDATE precios_referencia SET precio = 8.00 WHERE codigo = 'DEM-005';
UPDATE precios_referencia SET precio = 25.00 WHERE codigo = 'DEM-006';
UPDATE precios_referencia SET precio = 45.00 WHERE codigo = 'DEM-007';
UPDATE precios_referencia SET precio = 18.00 WHERE codigo = 'DEM-008';
UPDATE precios_referencia SET precio = 22.00 WHERE codigo = 'DEM-009';
UPDATE precios_referencia SET precio = 4.80 WHERE codigo = 'DEM-010';
UPDATE precios_referencia SET precio = 45.00 WHERE codigo = 'DEM-011';
UPDATE precios_referencia SET precio = 9.50 WHERE codigo = 'DEM-012';
UPDATE precios_referencia SET precio = 380.00 WHERE codigo = 'DEM-013';
UPDATE precios_referencia SET precio = 1200.00 WHERE codigo = 'DEM-014';

-- Albañilería
UPDATE precios_referencia SET precio = 22.00 WHERE codigo = 'ALB-001';
UPDATE precios_referencia SET precio = 17.00 WHERE codigo = 'ALB-002';
UPDATE precios_referencia SET precio = 30.00 WHERE codigo = 'ALB-003';
UPDATE precios_referencia SET precio = 24.00 WHERE codigo = 'ALB-004';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'ALB-005';
UPDATE precios_referencia SET precio = 28.00 WHERE codigo = 'ALB-006';
UPDATE precios_referencia SET precio = 32.00 WHERE codigo = 'ALB-007';
UPDATE precios_referencia SET precio = 20.00 WHERE codigo = 'ALB-008';
UPDATE precios_referencia SET precio = 32.00 WHERE codigo = 'ALB-009';
UPDATE precios_referencia SET precio = 28.00 WHERE codigo = 'ALB-010';
UPDATE precios_referencia SET precio = 16.00 WHERE codigo = 'ALB-011';
UPDATE precios_referencia SET precio = 550.00 WHERE codigo = 'ALB-012';
UPDATE precios_referencia SET precio = 480.00 WHERE codigo = 'ALB-013';

-- Solados y Alicatados
UPDATE precios_referencia SET precio = 42.00 WHERE codigo = 'SOL-001';
UPDATE precios_referencia SET precio = 36.00 WHERE codigo = 'SOL-002';
UPDATE precios_referencia SET precio = 34.00 WHERE codigo = 'SOL-003';
UPDATE precios_referencia SET precio = 45.00 WHERE codigo = 'SOL-004';
UPDATE precios_referencia SET precio = 11.00 WHERE codigo = 'SOL-005';
UPDATE precios_referencia SET precio = 30.00 WHERE codigo = 'SOL-006';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'SOL-007';
UPDATE precios_referencia SET precio = 78.00 WHERE codigo = 'SOL-008';
UPDATE precios_referencia SET precio = 65.00 WHERE codigo = 'SOL-009';
UPDATE precios_referencia SET precio = 13.00 WHERE codigo = 'SOL-010';
UPDATE precios_referencia SET precio = 60.00 WHERE codigo = 'SOL-011';

-- Fontanería
UPDATE precios_referencia SET precio = 1050.00 WHERE codigo = 'FON-001';
UPDATE precios_referencia SET precio = 800.00 WHERE codigo = 'FON-002';
UPDATE precios_referencia SET precio = 390.00 WHERE codigo = 'FON-003';
UPDATE precios_referencia SET precio = 350.00 WHERE codigo = 'FON-004';
UPDATE precios_referencia SET precio = 550.00 WHERE codigo = 'FON-005';
UPDATE precios_referencia SET precio = 650.00 WHERE codigo = 'FON-006';
UPDATE precios_referencia SET precio = 310.00 WHERE codigo = 'FON-007';
UPDATE precios_referencia SET precio = 350.00 WHERE codigo = 'FON-008';
UPDATE precios_referencia SET precio = 22.00 WHERE codigo = 'FON-009';
UPDATE precios_referencia SET precio = 15.00 WHERE codigo = 'FON-010';
UPDATE precios_referencia SET precio = 18.00 WHERE codigo = 'FON-011';
UPDATE precios_referencia SET precio = 11.00 WHERE codigo = 'FON-012';
UPDATE precios_referencia SET precio = 80.00 WHERE codigo = 'FON-013';
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'FON-014';
UPDATE precios_referencia SET precio = 420.00 WHERE codigo = 'FON-015';
UPDATE precios_referencia SET precio = 720.00 WHERE codigo = 'FON-016';

-- Electricidad
UPDATE precios_referencia SET precio = 68.00 WHERE codigo = 'ELE-001';
UPDATE precios_referencia SET precio = 92.00 WHERE codigo = 'ELE-002';
UPDATE precios_referencia SET precio = 60.00 WHERE codigo = 'ELE-003';
UPDATE precios_referencia SET precio = 65.00 WHERE codigo = 'ELE-004';
UPDATE precios_referencia SET precio = 480.00 WHERE codigo = 'ELE-005';
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'ELE-006';
UPDATE precios_referencia SET precio = 3800.00 WHERE codigo = 'ELE-007';
UPDATE precios_referencia SET precio = 42.00 WHERE codigo = 'ELE-008';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'ELE-009';
UPDATE precios_referencia SET precio = 15.00 WHERE codigo = 'ELE-010';
UPDATE precios_referencia SET precio = 11.00 WHERE codigo = 'ELE-011';
UPDATE precios_referencia SET precio = 150.00 WHERE codigo = 'ELE-012';
UPDATE precios_referencia SET precio = 105.00 WHERE codigo = 'ELE-013';

-- Pintura
UPDATE precios_referencia SET precio = 10.00 WHERE codigo = 'PIN-001';
UPDATE precios_referencia SET precio = 11.50 WHERE codigo = 'PIN-002';
UPDATE precios_referencia SET precio = 17.00 WHERE codigo = 'PIN-003';
UPDATE precios_referencia SET precio = 15.00 WHERE codigo = 'PIN-004';
UPDATE precios_referencia SET precio = 4.50 WHERE codigo = 'PIN-005';
UPDATE precios_referencia SET precio = 8.00 WHERE codigo = 'PIN-006';
UPDATE precios_referencia SET precio = 28.00 WHERE codigo = 'PIN-007';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'PIN-008';
UPDATE precios_referencia SET precio = 150.00 WHERE codigo = 'PIN-009';

-- Carpintería
UPDATE precios_referencia SET precio = 390.00 WHERE codigo = 'CAR-001';
UPDATE precios_referencia SET precio = 580.00 WHERE codigo = 'CAR-002';
UPDATE precios_referencia SET precio = 1100.00 WHERE codigo = 'CAR-003';
UPDATE precios_referencia SET precio = 460.00 WHERE codigo = 'CAR-004';
UPDATE precios_referencia SET precio = 420.00 WHERE codigo = 'CAR-005';
UPDATE precios_referencia SET precio = 340.00 WHERE codigo = 'CAR-006';
UPDATE precios_referencia SET precio = 300.00 WHERE codigo = 'CAR-007';
UPDATE precios_referencia SET precio = 380.00 WHERE codigo = 'CAR-008';
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'CAR-009';
UPDATE precios_referencia SET precio = 15.00 WHERE codigo = 'CAR-010';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'CAR-011';

-- Impermeabilización
UPDATE precios_referencia SET precio = 28.00 WHERE codigo = 'IMP-001';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'IMP-002';
UPDATE precios_referencia SET precio = 20.00 WHERE codigo = 'IMP-003';
UPDATE precios_referencia SET precio = 42.00 WHERE codigo = 'IMP-004';
UPDATE precios_referencia SET precio = 8.50 WHERE codigo = 'IMP-005';

-- Cerrajería
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'CER-001';
UPDATE precios_referencia SET precio = 150.00 WHERE codigo = 'CER-002';
UPDATE precios_referencia SET precio = 120.00 WHERE codigo = 'CER-003';
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'CER-004';
UPDATE precios_referencia SET precio = 2800.00 WHERE codigo = 'CER-005';

-- Instalaciones
UPDATE precios_referencia SET precio = 1100.00 WHERE codigo = 'INS-001';
UPDATE precios_referencia SET precio = 1450.00 WHERE codigo = 'INS-002';
UPDATE precios_referencia SET precio = 2600.00 WHERE codigo = 'INS-003';
UPDATE precios_referencia SET precio = 35.00 WHERE codigo = 'INS-004';
UPDATE precios_referencia SET precio = 68.00 WHERE codigo = 'INS-005';
UPDATE precios_referencia SET precio = 28.00 WHERE codigo = 'INS-006';
UPDATE precios_referencia SET precio = 18.00 WHERE codigo = 'INS-007';
UPDATE precios_referencia SET precio = 5800.00 WHERE codigo = 'INS-008';
UPDATE precios_referencia SET precio = 150.00 WHERE codigo = 'INS-009';

-- Cocina
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'COC-001';
UPDATE precios_referencia SET precio = 185.00 WHERE codigo = 'COC-002';
UPDATE precios_referencia SET precio = 400.00 WHERE codigo = 'COC-003';
UPDATE precios_referencia SET precio = 220.00 WHERE codigo = 'COC-004';
UPDATE precios_referencia SET precio = 185.00 WHERE codigo = 'COC-005';
UPDATE precios_referencia SET precio = 105.00 WHERE codigo = 'COC-006';
UPDATE precios_referencia SET precio = 150.00 WHERE codigo = 'COC-007';
UPDATE precios_referencia SET precio = 100.00 WHERE codigo = 'COC-008';
UPDATE precios_referencia SET precio = 185.00 WHERE codigo = 'COC-009';
UPDATE precios_referencia SET precio = 105.00 WHERE codigo = 'COC-010';

-- Limpieza
UPDATE precios_referencia SET precio = 5.50 WHERE codigo = 'LIM-001';
UPDATE precios_referencia SET precio = 4.00 WHERE codigo = 'LIM-002';
UPDATE precios_referencia SET precio = 42.00 WHERE codigo = 'LIM-003';

-- Varios
UPDATE precios_referencia SET precio = 4.50 WHERE codigo = 'VAR-001';
UPDATE precios_referencia SET precio = 300.00 WHERE codigo = 'VAR-002';
UPDATE precios_referencia SET precio = 420.00 WHERE codigo = 'VAR-003';
UPDATE precios_referencia SET precio = 750.00 WHERE codigo = 'VAR-004';
UPDATE precios_referencia SET precio = 480.00 WHERE codigo = 'VAR-005';
