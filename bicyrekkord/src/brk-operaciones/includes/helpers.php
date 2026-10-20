<?php
defined( 'ABSPATH' ) || exit;

/** Deja solo los dígitos (para comparar NIT, cédulas y celulares). */
function brk_digitos( $valor ) {
	return preg_replace( '/\D+/', '', (string) $valor );
}

/** Celular colombiano normalizado: últimos 10 dígitos (quita el 57). */
function brk_celular( $valor ) {
	$d = brk_digitos( $valor );
	return strlen( $d ) > 10 ? substr( $d, -10 ) : $d;
}

/** NIT sin dígito de verificación y sin puntos, para comparar. */
function brk_nit_base( $valor ) {
	$valor = trim( (string) $valor );
	if ( strpos( $valor, '-' ) !== false ) {
		$valor = substr( $valor, 0, strrpos( $valor, '-' ) );
	}
	return brk_digitos( $valor );
}

function brk_tipos_documento() {
	return array(
		'NIT' => 'NIT',
		'CC'  => 'Cédula de ciudadanía',
		'CE'  => 'Cédula de extranjería',
		'PP'  => 'Pasaporte',
	);
}

function brk_es_taller( $user_id ) {
	return $user_id && get_user_meta( $user_id, 'brk_tipo_cuenta', true ) === 'taller';
}

function brk_transportadoras() {
	$lista = array_filter( array_map( 'trim', explode( "\n", (string) get_option( 'brk_transportadoras', '' ) ) ) );
	return $lista ? array_values( $lista ) : array( 'Servientrega', 'Interrapidísimo', 'Coordinadora' );
}

function brk_correo_contabilidad() {
	$c = sanitize_email( get_option( 'brk_fe_correo', 'contabilidad@bicyrekkord.com' ) );
	return $c ? $c : 'contabilidad@bicyrekkord.com';
}
