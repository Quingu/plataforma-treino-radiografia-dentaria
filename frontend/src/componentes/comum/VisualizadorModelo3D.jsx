import { Component, Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, Html, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { formatarPonto3D } from '../../utils/tarefa3d';

const LIMITE_ARRASTO_PX = 6;

class LimiteErroModelo extends Component {
  constructor(props) {
    super(props);
    this.state = { falhou: false };
  }

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  componentDidCatch() {
    // O fallback visual já informa o problema ao usuário.
  }

  render() {
    if (this.state.falhou) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-semibold text-red-300">
            Não foi possível carregar o modelo 3D.
          </p>
          <p className="text-xs text-slate-400">
            A URL assinada pode ter expirado. Recarregue a página e tente novamente.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ falhou: false })}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-blue-500"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ModeloSelecionavel({ url, pontoLocal, aoSelecionar, desabilitado }) {
  const { scene } = useGLTF(url);
  const inicioArraste = useRef(null);

  const raioMarcador = useMemo(() => {
    const caixa = new THREE.Box3().setFromObject(scene);
    const tamanho = new THREE.Vector3();
    caixa.getSize(tamanho);
    return Math.max(tamanho.length() * 0.012, 0.0005);
  }, [scene]);

  const posicaoMarcador = useMemo(() => {
    if (!pontoLocal) {
      return null;
    }

    scene.updateWorldMatrix(true, false);
    return scene.localToWorld(
      new THREE.Vector3(pontoLocal.x, pontoLocal.y, pontoLocal.z),
    );
  }, [pontoLocal, scene]);

  const aoPressionar = (evento) => {
    evento.stopPropagation();
    inicioArraste.current = {
      x: evento.nativeEvent?.clientX ?? evento.clientX,
      y: evento.nativeEvent?.clientY ?? evento.clientY,
    };
  };

  const aoSoltar = (evento) => {
    evento.stopPropagation();

    const inicio = inicioArraste.current;
    inicioArraste.current = null;

    if (desabilitado || !inicio) {
      return;
    }

    const fimX = evento.nativeEvent?.clientX ?? evento.clientX;
    const fimY = evento.nativeEvent?.clientY ?? evento.clientY;

    if (Math.hypot(fimX - inicio.x, fimY - inicio.y) > LIMITE_ARRASTO_PX) {
      return;
    }

    scene.updateWorldMatrix(true, false);
    const local = scene.worldToLocal(evento.point.clone());

    aoSelecionar({ x: local.x, y: local.y, z: local.z });
  };

  return (
    <group onPointerDown={aoPressionar} onPointerUp={aoSoltar}>
      <primitive object={scene} />

      {posicaoMarcador && (
        <mesh position={posicaoMarcador} renderOrder={999}>
          <sphereGeometry args={[raioMarcador, 20, 20]} />
          <meshBasicMaterial color="#38bdf8" depthTest={false} />
        </mesh>
      )}
    </group>
  );
}

function CarregandoModelo() {
  return (
    <Html center>
      <span className="whitespace-nowrap text-xs text-slate-300">
        Carregando modelo 3D...
      </span>
    </Html>
  );
}

export default function VisualizadorModelo3D({
  url,
  pontoLocal = null,
  aoSelecionar,
  desabilitado = false,
  className = '',
  altura = 'h-[65vh]',
}) {
  if (!url) {
    return (
      <div
        className={`flex ${altura} items-center justify-center rounded-xl border border-slate-800 bg-black text-sm text-slate-400 ${className}`}
      >
        Modelo 3D indisponível.
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-black ${altura} ${className}`}
    >
      <LimiteErroModelo key={url}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 45 }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            gl.setClearColor('#05080f');
          }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 8, 6]} intensity={1.8} />
          <directionalLight position={[-6, -4, -8]} intensity={0.6} />
          <hemisphereLight args={['#ffffff', '#1e293b', 0.6]} />

          <Suspense fallback={<CarregandoModelo />}>
            <Bounds fit clip observe margin={1.25}>
              <ModeloSelecionavel
                url={url}
                pontoLocal={pontoLocal}
                aoSelecionar={aoSelecionar}
                desabilitado={desabilitado}
              />
            </Bounds>
          </Suspense>

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.12}
            enablePan
            enableRotate
            enableZoom
          />
        </Canvas>
      </LimiteErroModelo>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        <span className="text-[11px] text-slate-300">
          Arraste para girar · use o scroll para zoom · clique para marcar
        </span>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-mono text-sky-300">
          {formatarPonto3D(pontoLocal)}
        </span>
      </div>
    </div>
  );
}
