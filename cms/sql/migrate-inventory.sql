-- Inventory: items, purchases (with optional invoice file) and manual stock adjustments

CREATE TABLE IF NOT EXISTS inventory_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(60) DEFAULT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',
  min_stock INT UNSIGNED NOT NULL DEFAULT 0,
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_inventory_items_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_purchases (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  purchased_on DATE NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  vendor VARCHAR(120) DEFAULT NULL,
  invoice_path VARCHAR(255) DEFAULT NULL,
  invoice_name VARCHAR(160) DEFAULT NULL,
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_inventory_purchases_item (item_id, purchased_on),
  CONSTRAINT fk_inventory_purchases_item FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_id INT UNSIGNED NOT NULL,
  adjusted_on DATE NOT NULL,
  delta INT NOT NULL,
  reason VARCHAR(20) NOT NULL,
  notes VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_inventory_adjustments_item (item_id, adjusted_on),
  CONSTRAINT fk_inventory_adjustments_item FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
