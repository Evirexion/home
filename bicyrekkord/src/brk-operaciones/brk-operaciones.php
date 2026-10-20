<?php
/**
 * Plugin Name: BRK Operaciones
 * Description: Cuentas de clientes y talleres (con validación de NIT/documento), solicitud de factura electrónica a contabilidad, estados de pedido con seguimiento y un panel simple para cambiar el estado de los pedidos.
 * Version: 1.0.0
 * Author: Rekkord S.A.S.
 * Text Domain: brk-operaciones
 * Requires Plugins: woocommerce
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * WC requires at least: 8.0
 */

defined( 'ABSPATH' ) || exit;

define( 'BRK_OPS_VERSION', '1.0.0' );
define( 'BRK_OPS_FILE', __FILE__ );
define( 'BRK_OPS_DIR', plugin_dir_path( __FILE__ ) );
define( 'BRK_OPS_URL', plugin_dir_url( __FILE__ ) );

// Compatible con el almacenamiento de pedidos de alto rendimiento (HPOS) de WooCommerce.
add_action( 'before_woocommerce_init', function () {
	if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
	}
} );

require_once BRK_OPS_DIR . 'includes/helpers.php';
require_once BRK_OPS_DIR . 'includes/class-brk-talleres.php';
require_once BRK_OPS_DIR . 'includes/estados.php';
require_once BRK_OPS_DIR . 'includes/registro.php';
require_once BRK_OPS_DIR . 'includes/factura.php';
require_once BRK_OPS_DIR . 'includes/mi-cuenta.php';
require_once BRK_OPS_DIR . 'includes/panel.php';
require_once BRK_OPS_DIR . 'includes/ajustes.php';

register_activation_hook( __FILE__, 'brk_ops_activar' );
function brk_ops_activar() {
	BRK_Talleres::crear_tabla();
	if ( ! get_role( 'taller' ) ) {
		$customer = get_role( 'customer' );
		add_role( 'taller', 'Taller', $customer ? $customer->capabilities : array( 'read' => true ) );
	}
	add_option( 'brk_fe_correo', 'contabilidad@bicyrekkord.com' );
	add_option( 'brk_transportadoras', "Servientrega\nInterrapidísimo\nCoordinadora\nEnvía\nTCC\nMensajero Bicyrekkord" );
	// Registro de cuentas desde "Mi cuenta", con contraseña elegida por el cliente.
	update_option( 'woocommerce_enable_myaccount_registration', 'yes' );
	update_option( 'woocommerce_registration_generate_password', 'no' );
	update_option( 'woocommerce_registration_generate_username', 'yes' );
}

// Si el plugin se actualiza sin reactivarse, asegura la tabla.
add_action( 'plugins_loaded', function () {
	if ( get_option( 'brk_ops_db' ) !== BRK_OPS_VERSION ) {
		BRK_Talleres::crear_tabla();
		update_option( 'brk_ops_db', BRK_OPS_VERSION );
	}
} );
