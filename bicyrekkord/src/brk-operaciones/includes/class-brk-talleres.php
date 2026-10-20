<?php
/**
 * Base de datos de talleres que ya trabajan con Bicyrekkord.
 * Se alimenta importando el Excel/Google Sheets como CSV y sirve para reconocer
 * a un taller cuando crea su cuenta (por NIT, correo o celular).
 */
defined( 'ABSPATH' ) || exit;

class BRK_Talleres {

	public static function tabla() {
		global $wpdb;
		return $wpdb->prefix . 'brk_talleres';
	}

	public static function crear_tabla() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$t       = self::tabla();
		$charset = $wpdb->get_charset_collate();
		dbDelta( "CREATE TABLE {$t} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			nit varchar(30) NOT NULL DEFAULT '',
			nit_texto varchar(40) NOT NULL DEFAULT '',
			nombre varchar(190) NOT NULL DEFAULT '',
			ciudad varchar(120) NOT NULL DEFAULT '',
			celular varchar(20) NOT NULL DEFAULT '',
			correo varchar(190) NOT NULL DEFAULT '',
			origen varchar(20) NOT NULL DEFAULT 'importado',
			creado datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
			PRIMARY KEY  (id),
			KEY nit (nit),
			KEY celular (celular),
			KEY correo (correo)
		) {$charset};" );
	}

	/**
	 * Busca un taller por NIT/documento, correo o celular. Devuelve la fila o null.
	 */
	public static function buscar( $documento = '', $correo = '', $celular = '' ) {
		global $wpdb;
		$t     = self::tabla();
		$where = array();
		$args  = array();
		$doc   = brk_nit_base( $documento );
		if ( strlen( $doc ) >= 5 ) {
			$where[] = 'nit = %s';
			$args[]  = $doc;
		}
		$correo = strtolower( sanitize_email( $correo ) );
		if ( $correo ) {
			$where[] = 'correo = %s';
			$args[]  = $correo;
		}
		$cel = brk_celular( $celular );
		if ( strlen( $cel ) >= 7 ) {
			$where[] = 'celular = %s';
			$args[]  = $cel;
		}
		if ( ! $where ) {
			return null;
		}
		$sql = "SELECT * FROM {$t} WHERE " . implode( ' OR ', $where ) . ' LIMIT 1';
		$row = $wpdb->get_row( $wpdb->prepare( $sql, $args ) ); // phpcs:ignore WordPress.DB.PreparedSQL
		return $row ? $row : null;
	}

	public static function guardar( $datos, $origen = 'importado' ) {
		global $wpdb;
		$fila = array(
			'nit'       => brk_nit_base( $datos['nit'] ?? '' ),
			'nit_texto' => sanitize_text_field( $datos['nit'] ?? '' ),
			'nombre'    => sanitize_text_field( $datos['nombre'] ?? '' ),
			'ciudad'    => sanitize_text_field( $datos['ciudad'] ?? '' ),
			'celular'   => brk_celular( $datos['celular'] ?? '' ),
			'correo'    => strtolower( sanitize_email( $datos['correo'] ?? '' ) ),
			'origen'    => $origen,
		);
		$existe = null;
		if ( $fila['nit'] ) {
			$existe = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . self::tabla() . ' WHERE nit = %s', $fila['nit'] ) );
		}
		if ( $existe ) {
			$wpdb->update( self::tabla(), array_filter( $fila ), array( 'id' => $existe ) );
			return 'actualizado';
		}
		$fila['creado'] = current_time( 'mysql' );
		$wpdb->insert( self::tabla(), $fila );
		return 'nuevo';
	}

	/**
	 * Importa un CSV exportado de Excel o Google Sheets.
	 * Reconoce encabezados como: NIT / Documento / Cédula, Nombre / Razón social / Taller,
	 * Ciudad, Celular / Teléfono / WhatsApp, Correo / Email. Acepta separador , o ;
	 */
	public static function importar_csv( $ruta ) {
		$res = array( 'nuevos' => 0, 'actualizados' => 0, 'omitidos' => 0, 'error' => '' );
		$txt = file_get_contents( $ruta ); // phpcs:ignore
		if ( false === $txt || '' === trim( $txt ) ) {
			$res['error'] = 'El archivo está vacío.';
			return $res;
		}
		$txt = preg_replace( '/^\xEF\xBB\xBF/', '', $txt );
		if ( ! mb_check_encoding( $txt, 'UTF-8' ) ) {
			$txt = mb_convert_encoding( $txt, 'UTF-8', 'Windows-1252' );
		}
		$lineas = preg_split( '/\r\n|\r|\n/', $txt );
		$primera = $lineas[0];
		$sep     = substr_count( $primera, ';' ) > substr_count( $primera, ',' ) ? ';' : ',';
		$enc     = array_map( array( __CLASS__, 'clave_encabezado' ), str_getcsv( $primera, $sep ) );
		$mapa    = array();
		foreach ( $enc as $i => $k ) {
			if ( $k && ! isset( $mapa[ $k ] ) ) {
				$mapa[ $k ] = $i;
			}
		}
		if ( ! isset( $mapa['nit'] ) && ! isset( $mapa['nombre'] ) ) {
			$res['error'] = 'No encontré columnas de NIT/Documento ni Nombre en la primera fila.';
			return $res;
		}
		$n = count( $lineas );
		for ( $i = 1; $i < $n; $i++ ) {
			if ( '' === trim( $lineas[ $i ] ) ) {
				continue;
			}
			$c     = str_getcsv( $lineas[ $i ], $sep );
			$datos = array();
			foreach ( $mapa as $k => $idx ) {
				$datos[ $k ] = isset( $c[ $idx ] ) ? trim( $c[ $idx ] ) : '';
			}
			if ( empty( $datos['nit'] ) && empty( $datos['correo'] ) && empty( $datos['celular'] ) ) {
				$res['omitidos']++;
				continue;
			}
			$r = self::guardar( $datos, 'importado' );
			$res[ 'nuevo' === $r ? 'nuevos' : 'actualizados' ]++;
		}
		return $res;
	}

	private static function clave_encabezado( $h ) {
		$h = strtolower( remove_accents( trim( (string) $h ) ) );
		if ( preg_match( '/nit|documento|cedula|identificacion|\bcc\b/', $h ) ) {
			return 'nit';
		}
		if ( preg_match( '/correo|e-?mail/', $h ) ) {
			return 'correo';
		}
		if ( preg_match( '/celular|telefono|whatsapp|movil|tel\b/', $h ) ) {
			return 'celular';
		}
		if ( preg_match( '/ciudad|municipio/', $h ) ) {
			return 'ciudad';
		}
		if ( preg_match( '/nombre|razon|taller|cliente|empresa/', $h ) ) {
			return 'nombre';
		}
		return '';
	}

	public static function contar() {
		global $wpdb;
		return (int) $wpdb->get_var( 'SELECT COUNT(*) FROM ' . self::tabla() );
	}

	public static function listar( $q = '', $limite = 50 ) {
		global $wpdb;
		$t = self::tabla();
		if ( $q ) {
			$like = '%' . $wpdb->esc_like( $q ) . '%';
			return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$t} WHERE nombre LIKE %s OR nit LIKE %s OR ciudad LIKE %s OR correo LIKE %s ORDER BY nombre LIMIT %d", $like, $like, $like, $like, $limite ) ); // phpcs:ignore
		}
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$t} ORDER BY nombre LIMIT %d", $limite ) ); // phpcs:ignore
	}
}
