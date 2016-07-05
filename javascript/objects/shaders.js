const glslify = require( "glslify" );

const vertex = glslify( __dirname + "/../shaders/vertex.glsl" );
const fragment = glslify( __dirname + "/../shaders/fragment.glsl" );

module.exports.vertex = vertex;
module.exports.fragment = fragment;

/**
precision highp float;
precision highp int;
#define SHADER_NAME MeshLambertMaterial
#define GAMMA_FACTOR 2
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
varying vec3 vLightFront;
#ifdef DOUBLE_SIDED
    varying vec3 vLightBack;
#endif
#define PI 3.14159
#define PI2 6.28318
#define RECIPROCAL_PI 0.31830988618
#define RECIPROCAL_PI2 0.15915494
#define LOG2 1.442695
#define EPSILON 1e-6
#define saturate(a) clamp( a, 0.0, 1.0 )
#define whiteCompliment(a) ( 1.0 - saturate( a ) )
float square( const in float x ) { return x*x; }
float average( const in vec3 color ) { return dot( color, vec3( 0.3333 ) ); }
struct IncidentLight {
    vec3 color;
    vec3 direction;
};
struct ReflectedLight {
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};
struct GeometricContext {
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
vec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    float distance = dot( planeNormal, point - pointOnPlane );
    return - distance * planeNormal + point;
}
float sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return sign( dot( point - pointOnPlane, planeNormal ) );
}
vec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {
    return lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) ) + pointOnLine;
}
vec3 inputToLinear( in vec3 a ) {
    #ifdef GAMMA_INPUT
        return pow( a, vec3( float( GAMMA_FACTOR ) ) );
    #else
        return a;
    #endif
}
vec3 linearToOutput( in vec3 a ) {
    #ifdef GAMMA_OUTPUT
        return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );
    #else
        return a;
    #endif
}

#ifdef USE_COLOR
    varying vec3 vColor;
#endif

#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP )
    varying vec2 vUv;
#endif
#if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    varying vec2 vUv2;
#endif
#ifdef USE_MAP
    uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
    uniform sampler2D alphaMap;
#endif

#ifdef USE_AOMAP
    uniform sampler2D aoMap;
    uniform float aoMapIntensity;
#endif
#ifdef USE_LIGHTMAP
    uniform sampler2D lightMap;
    uniform float lightMapIntensity;
#endif
#ifdef USE_EMISSIVEMAP
    uniform sampler2D emissiveMap;
#endif

#if defined( USE_ENVMAP ) || defined( STANDARD )
    uniform float reflectivity;
    uniform float envMapIntenstiy;
#endif
#ifdef USE_ENVMAP
    #ifdef ENVMAP_TYPE_CUBE
        uniform samplerCube envMap;
    #else
        uniform sampler2D envMap;
    #endif
    uniform float flipEnvMap;
    #if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( STANDARD )
        uniform float refractionRatio;
    #else
        varying vec3 vReflect;
    #endif
#endif

float calcLightAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
    if ( decayExponent > 0.0 ) {
      return pow( saturate( -lightDistance / cutoffDistance + 1.0 ), decayExponent );
    }
    return 1.0;
}
vec3 BRDF_Diffuse_Lambert( const in vec3 diffuseColor ) {
    return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 specularColor, const in float dotLH ) {
    float fresnel = exp2( ( -5.55473 * dotLH - 6.98316 ) * dotLH );
    return ( 1.0 - specularColor ) * fresnel + specularColor;
}
float G_GGX_Smith( const in float alpha, const in float dotNL, const in float dotNV ) {
    float a2 = alpha * alpha;
    float gl = dotNL + pow( a2 + ( 1.0 - a2 ) * dotNL * dotNL, 0.5 );
    float gv = dotNV + pow( a2 + ( 1.0 - a2 ) * dotNV * dotNV, 0.5 );
    return 1.0 / ( gl * gv );
}
float D_GGX( const in float alpha, const in float dotNH ) {
    float a2 = alpha * alpha;
    float denom = dotNH * dotNH * ( a2 - 1.0 ) + 1.0;
    return RECIPROCAL_PI * a2 / ( denom * denom );
}
vec3 BRDF_Specular_GGX( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
    float alpha = roughness * roughness;
    vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
    float dotNL = saturate( dot( geometry.normal, incidentLight.direction ) );
    float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
    float dotNH = saturate( dot( geometry.normal, halfDir ) );
    float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
    vec3 F = F_Schlick( specularColor, dotLH );
    float G = G_GGX_Smith( alpha, dotNL, dotNV );
    float D = D_GGX( alpha, dotNH );
    return F * ( G * D );
}
vec3 BRDF_Specular_GGX_Environment( const in GeometricContext geometry, const in vec3 specularColor, const in float roughness ) {
    float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
    const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
    const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
    vec4 r = roughness * c0 + c1;
    float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
    vec2 AB = vec2( -1.04, 1.04 ) * a004 + r.zw;
    return specularColor * AB.x + AB.y;
}
float G_BlinnPhong_Implicit( ) {
    return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
    return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_Specular_BlinnPhong( const in IncidentLight incidentLight, const in GeometricContext geometry, const in vec3 specularColor, const in float shininess ) {
    vec3 halfDir = normalize( incidentLight.direction + geometry.viewDir );
    float dotNH = saturate( dot( geometry.normal, halfDir ) );
    float dotLH = saturate( dot( incidentLight.direction, halfDir ) );
    vec3 F = F_Schlick( specularColor, dotLH );
    float G = G_BlinnPhong_Implicit( );
    float D = D_BlinnPhong( shininess, dotNH );
    return F * ( G * D );
}
float GGXRoughnessToBlinnExponent( const in float ggxRoughness ) {
    return ( 2.0 / square( ggxRoughness + 0.0001 ) - 2.0 );
}
uniform vec3 ambientLightColor;
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
    return PI * ambientLightColor;
}

struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};
uniform PointLight pointLights[ 1 ];
IncidentLight getPointDirectLight( const in PointLight pointLight, const in GeometricContext geometry ) {
    IncidentLight directLight;
    vec3 lVector = pointLight.position - geometry.position;
    directLight.direction = normalize( lVector );
    directLight.color = pointLight.color;
    directLight.color *= calcLightAttenuation( length( lVector ), pointLight.distance, pointLight.decay );
    return directLight;
}


#if defined( USE_ENVMAP ) && defined( STANDARD )
    vec3 getLightProbeIndirectIrradiance( const in GeometricContext geometry, const in int maxMIPLevel ) {
        #ifdef DOUBLE_SIDED
            float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
        #else
            float flipNormal = 1.0;
        #endif
        vec3 worldNormal = inverseTransformDirection( geometry.normal, viewMatrix );
        #ifdef ENVMAP_TYPE_CUBE
            vec3 queryVec = flipNormal * vec3( flipEnvMap * worldNormal.x, worldNormal.yz );
            #ifdef TEXTURE_LOD_EXT
                vec4 envMapColor = textureCubeLodEXT( envMap, queryVec, float( maxMIPLevel ) );
            #else
                vec4 envMapColor = textureCube( envMap, queryVec, float( maxMIPLevel ) );
            #endif
        #else
            vec3 envMapColor = vec3( 0.0 );
        #endif
        envMapColor.rgb = inputToLinear( envMapColor.rgb );
        return PI * envMapColor.rgb * envMapIntensity;
    }
    float getSpecularMIPLevel( const in float blinnShininessExponent, const in int maxMIPLevel ) {
        float maxMIPLevelScalar = float( maxMIPLevel );
        float desiredMIPLevel = maxMIPLevelScalar - 0.79248 - 0.5 * log2( square( blinnShininessExponent ) + 1.0 );
        return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );
    }
    vec3 getLightProbeIndirectRadiance( const in GeometricContext geometry, const in float blinnShininessExponent, const in int maxMIPLevel ) {
        #ifdef ENVMAP_MODE_REFLECTION
            vec3 reflectVec = reflect( -geometry.viewDir, geometry.normal );
        #else
            vec3 reflectVec = refract( -geometry.viewDir, geometry.normal, refractionRatio );
        #endif
        #ifdef DOUBLE_SIDED
            float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
        #else
            float flipNormal = 1.0;
        #endif
        reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
        float specularMIPLevel = getSpecularMIPLevel( blinnShininessExponent, maxMIPLevel );
        #ifdef ENVMAP_TYPE_CUBE
            vec3 queryReflectVec = flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz );
            #ifdef TEXTURE_LOD_EXT
                vec4 envMapColor = textureCubeLodEXT( envMap, queryReflectVec, specularMIPLevel );
            #else
                vec4 envMapColor = textureCube( envMap, queryReflectVec, specularMIPLevel );
            #endif
        #elif defined( ENVMAP_TYPE_EQUIREC )
            vec2 sampleUV;
            sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
            sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
            #ifdef TEXTURE_LOD_EXT
                vec4 envMapColor = texture2DLodEXT( envMap, sampleUV, specularMIPLevel );
            #else
                vec4 envMapColor = texture2D( envMap, sampleUV, specularMIPLevel );
            #endif
        #elif defined( ENVMAP_TYPE_SPHERE )
            vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));
            #ifdef TEXTURE_LOD_EXT
                vec4 envMapColor = texture2DLodEXT( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
            #else
                vec4 envMapColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5, specularMIPLevel );
            #endif
        #endif
        envMapColor.rgb = inputToLinear( envMapColor.rgb );
        return envMapColor.rgb * envMapIntensity;
    }
#endif


float getShadowMask() {
    float shadow = 1.0;
    #ifdef USE_SHADOWMAP
    #if 0 > 0
    DirectionalLight directionalLight;

    #endif
    #if 0 > 0
    SpotLight spotLight;

    #endif
    #if 1 > 0
    PointLight pointLight;

        pointLight = pointLights[ 0 ];
        shadow *= bool( pointLight.shadow ) ? getPointShadow( pointShadowMap[ 0 ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ 0 ] ) : 1.0;

    #endif
    #endif
    return shadow;
}

#ifdef USE_SPECULARMAP
    uniform sampler2D specularMap;
#endif
#ifdef USE_LOGDEPTHBUF
    uniform float logDepthBufFC;
    #ifdef USE_LOGDEPTHBUF_EXT
        varying float vFragDepth;
    #endif
#endif

void main() {
    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveLight = emissive;
#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)
    gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;
#endif
#ifdef USE_MAP
    vec4 texelColor = texture2D( map, vUv );
    texelColor.xyz = inputToLinear( texelColor.xyz );
    diffuseColor *= texelColor;
#endif

#ifdef USE_COLOR
    diffuseColor.rgb *= vColor;
#endif
#ifdef USE_ALPHAMAP
    diffuseColor.a *= texture2D( alphaMap, vUv ).g;
#endif

#ifdef ALPHATEST
    if ( diffuseColor.a < ALPHATEST ) discard;
#endif

float specularStrength;
#ifdef USE_SPECULARMAP
    vec4 texelSpecular = texture2D( specularMap, vUv );
    specularStrength = texelSpecular.r;
#else
    specularStrength = 1.0;
#endif
#ifdef USE_EMISSIVEMAP
    vec4 emissiveColor = texture2D( emissiveMap, vUv );
    emissiveColor.rgb = inputToLinear( emissiveColor.rgb );
    totalEmissiveLight *= emissiveColor.rgb;
#endif

    reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );
#ifdef USE_LIGHTMAP
    reflectedLight.indirectDiffuse += PI * texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;
#endif

    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );
    #ifdef DOUBLE_SIDED
        reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;
    #else
        reflectedLight.directDiffuse = vLightFront;
    #endif
    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();
#ifdef USE_AOMAP
    reflectedLight.indirectDiffuse *= ( texture2D( aoMap, vUv2 ).r - 1.0 ) * aoMapIntensity + 1.0;
#endif

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveLight;
#ifdef USE_ENVMAP

    vec3 reflectVec = vReflect;

    #ifdef DOUBLE_SIDED
        float flipNormal = ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    #else
        float flipNormal = 1.0;
    #endif
    #ifdef ENVMAP_TYPE_CUBE
        vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
    #elif defined( ENVMAP_TYPE_EQUIREC )
        vec2 sampleUV;
        sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );
        sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
        vec4 envColor = texture2D( envMap, sampleUV );
    #elif defined( ENVMAP_TYPE_SPHERE )
        vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));
        vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );
    #endif
    envColor.xyz = inputToLinear( envColor.xyz );
    #ifdef ENVMAP_BLENDING_MULTIPLY
        outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
    #elif defined( ENVMAP_BLENDING_MIX )
        outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
    #elif defined( ENVMAP_BLENDING_ADD )
        outgoingLight += envColor.xyz * specularStrength * reflectivity;
    #endif
#endif


    outgoingLight = linearToOutput( outgoingLight );

    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
}
*/
