"use client";
import { Bubble, BubbleSidebar } from "@/components/BubbleSidebar";
import { ToolPanel, ToolType } from "@/components/editor/ToolPanel";
import { Button } from "@/components/ui/button";
import {
    BoxIcon as Bucket,
    Circle,
    Eraser,
    FlipHorizontal,
    Lasso,
    Minus,
    MousePointer,
    Move,
    Palette,
    Pencil,
    Pipette,
    RectangleHorizontal,
    RotateCw, Scale,
    Sparkles,
    SprayCanIcon as Spray,
    Type,
    Wand2,
    Zap
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("pencil");
  const [isMobileView, setIsMobileView] = useState(false);

  // Función para obtener el icono de la herramienta activa
  const getActiveToolIcon = () => {
    const toolIcons = {
      pencil: Pencil,
      eraser: Eraser,
      bucket: Bucket,
      eyedropper: Pipette,
      line: Minus,
      rectangle: RectangleHorizontal,
      circle: Circle,
      ellipse: Circle,
      spray: Spray,
      gradient: Zap,
      select: MousePointer,
      "border-select": Lasso,
      "magic-wand": Wand2,
      move: Move,
      rotate: RotateCw,
      scale: Scale,
      text: Type,
      noise: Sparkles,
      mirror: FlipHorizontal,
      "color-replace": Palette,
    };
    return toolIcons[activeTool] || Pencil;
  };

  // Función para obtener el color de la categoría de la herramienta activa
  const getActiveToolColor = () => {
    const basicTools = ["pencil", "eraser", "bucket", "eyedropper"];
    const shapeTools = ["line", "rectangle", "circle", "ellipse"];
    const artisticTools = ["spray", "gradient"];
    const selectionTools = ["select", "border-select", "magic-wand", "move", "rotate", "scale"];
    const advancedTools = ["text", "noise", "mirror", "color-replace"];

    if (basicTools.includes(activeTool)) return "text-blue-600";
    if (shapeTools.includes(activeTool)) return "text-green-600";
    if (artisticTools.includes(activeTool)) return "text-orange-600";
    if (selectionTools.includes(activeTool)) return "text-purple-600";
    if (advancedTools.includes(activeTool)) return "text-red-600";
    return "text-gray-600";
  };

  // Función para obtener la variante de la burbuja según la herramienta activa
  const getActiveToolVariant = () => {
    const basicTools = ["pencil", "eraser", "bucket", "eyedropper"];
    const shapeTools = ["line", "rectangle", "circle", "ellipse"];
    const selectionTools = ["select", "border-select", "magic-wand", "move", "rotate", "scale"];

    if (basicTools.includes(activeTool)) return "primary";
    if (shapeTools.includes(activeTool)) return "secondary";
    if (selectionTools.includes(activeTool)) return "accent";
    return undefined; // Para artistic y advanced tools
  };

  // Función para obtener el nombre en español de la herramienta
  const getActiveToolName = () => {
    const toolNames = {
      pencil: "Lápiz",
      eraser: "Borrador",
      bucket: "Balde de pintura",
      eyedropper: "Cuentagotas",
      line: "Línea",
      rectangle: "Rectángulo",
      circle: "Círculo",
      ellipse: "Elipse",
      spray: "Aerógrafo",
      gradient: "Degradado",
      select: "Seleccionar",
      "border-select": "Selección libre",
      "magic-wand": "Varita mágica",
      move: "Mover",
      rotate: "Rotar",
      scale: "Escalar",
      text: "Texto",
      noise: "Ruido",
      mirror: "Espejo",
      "color-replace": "Reemplazo de color",
    };
    return toolNames[activeTool] || activeTool;
  };

  const ActiveIcon = getActiveToolIcon();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1">
        {/* Left Sidebar Demo - Tool Categories */}
        <div className="w-80 bg-white shadow-lg">
          <BubbleSidebar align="left">
            {/* Categoría Básica */}
            <Bubble bubbleKey="basic-tools" variant="primary">
              <Bubble.Icon variant="primary">
                <Pencil size={20} className="text-blue-600" />
              </Bubble.Icon>
              <Bubble.Content width="medium">
                <Bubble.Header>Herramientas Básicas</Bubble.Header>
                <Bubble.Body>
                  <Bubble.Item 
                    icon={Pencil} 
                    onClick={() => setActiveTool("pencil")}
                  >
                    {activeTool === "pencil" ? "🎯 " : ""}Lápiz
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Eraser}
                    onClick={() => setActiveTool("eraser")}
                  >
                    {activeTool === "eraser" ? "🎯 " : ""}Borrador
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Bucket}
                    onClick={() => setActiveTool("bucket")}
                  >
                    {activeTool === "bucket" ? "🎯 " : ""}Balde de pintura
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Pipette}
                    onClick={() => setActiveTool("eyedropper")}
                  >
                    {activeTool === "eyedropper" ? "🎯 " : ""}Cuentagotas
                  </Bubble.Item>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>

            {/* Categoría Formas */}
            <Bubble bubbleKey="shapes-tools" variant="secondary">
              <Bubble.Icon variant="secondary">
                <RectangleHorizontal size={20} className="text-green-600" />
              </Bubble.Icon>
              <Bubble.Content width="medium">
                <Bubble.Header>Formas</Bubble.Header>
                <Bubble.Body>
                  <Bubble.Item 
                    icon={Minus}
                    onClick={() => setActiveTool("line")}
                  >
                    {activeTool === "line" ? "🎯 " : ""}Línea
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={RectangleHorizontal}
                    onClick={() => setActiveTool("rectangle")}
                  >
                    {activeTool === "rectangle" ? "🎯 " : ""}Rectángulo
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Circle}
                    onClick={() => setActiveTool("circle")}
                  >
                    {activeTool === "circle" ? "🎯 " : ""}Círculo
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Circle}
                    onClick={() => setActiveTool("ellipse")}
                  >
                    {activeTool === "ellipse" ? "🎯 " : ""}Elipse
                  </Bubble.Item>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>

            {/* Categoría Artística */}
            <Bubble bubbleKey="artistic-tools">
              <Bubble.Icon>
                <Spray size={20} className="text-orange-600" />
              </Bubble.Icon>
              <Bubble.Content width="medium">
                <Bubble.Header>Herramientas Artísticas</Bubble.Header>
                <Bubble.Body>
                  <Bubble.Item 
                    icon={Spray}
                    onClick={() => setActiveTool("spray")}
                  >
                    {activeTool === "spray" ? "🎯 " : ""}Aerógrafo
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Zap}
                    onClick={() => setActiveTool("gradient")}
                  >
                    {activeTool === "gradient" ? "🎯 " : ""}Degradado
                  </Bubble.Item>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>

            {/* Categoría Selección */}
            <Bubble bubbleKey="selection-tools" variant="accent">
              <Bubble.Icon variant="accent">
                <MousePointer size={20} className="text-purple-600" />
              </Bubble.Icon>
              <Bubble.Content width="large">
                <Bubble.Header>Herramientas de Selección</Bubble.Header>
                <Bubble.Body>
                  <Bubble.Item 
                    icon={MousePointer}
                    onClick={() => setActiveTool("select")}
                  >
                    {activeTool === "select" ? "🎯 " : ""}Seleccionar
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Lasso}
                    onClick={() => setActiveTool("border-select")}
                  >
                    {activeTool === "border-select" ? "🎯 " : ""}Selección libre
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Wand2}
                    onClick={() => setActiveTool("magic-wand")}
                  >
                    {activeTool === "magic-wand" ? "🎯 " : ""}Varita mágica
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Move}
                    onClick={() => setActiveTool("move")}
                  >
                    {activeTool === "move" ? "🎯 " : ""}Mover
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={RotateCw}
                    onClick={() => setActiveTool("rotate")}
                  >
                    {activeTool === "rotate" ? "🎯 " : ""}Rotar
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Scale}
                    onClick={() => setActiveTool("scale")}
                  >
                    {activeTool === "scale" ? "🎯 " : ""}Escalar
                  </Bubble.Item>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>

            {/* Categoría Avanzada */}
            <Bubble bubbleKey="advanced-tools" size="large">
              <Bubble.Icon size="large">
                <Type size={24} className="text-red-600" />
              </Bubble.Icon>
              <Bubble.Content width="medium">
                <Bubble.Header>Herramientas Avanzadas</Bubble.Header>
                <Bubble.Body>
                  <Bubble.Item 
                    icon={Type}
                    onClick={() => setActiveTool("text")}
                  >
                    {activeTool === "text" ? "🎯 " : ""}Texto
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Sparkles}
                    onClick={() => setActiveTool("noise")}
                  >
                    {activeTool === "noise" ? "🎯 " : ""}Ruido
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={FlipHorizontal}
                    onClick={() => setActiveTool("mirror")}
                  >
                    {activeTool === "mirror" ? "🎯 " : ""}Espejo
                  </Bubble.Item>
                  <Bubble.Item 
                    icon={Palette}
                    onClick={() => setActiveTool("color-replace")}
                  >
                    {activeTool === "color-replace" ? "🎯 " : ""}Reemplazo de color
                  </Bubble.Item>
                </Bubble.Body>
                <Bubble.Footer>
                  <Button size="sm" variant="outline" className="w-full">
                    Ver todas las herramientas
                  </Button>
                </Bubble.Footer>
              </Bubble.Content>
            </Bubble>

            {/* Burbuja de Configuracion de Herramienta Activa */}
            <Bubble bubbleKey="active-tool" variant={getActiveToolVariant()}>
              <Bubble.Icon variant={getActiveToolVariant()}>
                <ActiveIcon size={20} className={getActiveToolColor()} />
              </Bubble.Icon>
              <Bubble.Content width="small">
                <Bubble.Header>🎯 Configuracion de Herramienta Activa</Bubble.Header>
                <Bubble.Body>
                  <div className="text-center p-2">
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      {getActiveToolName()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Herramienta seleccionada actualmente
                    </div>
                  </div>
                </Bubble.Body>
              </Bubble.Content>
            </Bubble>
          </BubbleSidebar>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Tool Panel Demo - Comparación de Implementaciones</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">Comparación: BubbleSidebar vs ToolPanel</h2>
              <p className="text-gray-600 mb-4">
                Comparación lado a lado del panel de herramientas implementado con BubbleSidebar (izquierda) 
                vs el componente ToolPanel original (derecha). Ambas implementaciones muestran las mismas categorías y herramientas.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Izquierda:</strong> Implementación con BubbleSidebar - Organizado por categorías como burbujas expandibles</li>
                <li>• <strong>Derecha:</strong> Componente ToolPanel original - Vista tradicional con categorías agrupadas</li>
                <li>• Ambas versiones comparten el estado de herramienta activa</li>
                <li>• Interacción responsive y visual feedback</li>
                <li>• Iconos consistentes entre implementaciones</li>
              </ul>
            </div>

            {/* Tool Panel Demo Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-4">ToolPanel Original - Componente Tradicional</h2>
              <p className="text-gray-600 mb-4">
                Esta es la implementación original del ToolPanel con categorías agrupadas verticalmente.
                Puedes alternar entre vista móvil y desktop para ver las diferentes presentaciones.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Herramienta activa:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {activeTool}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMobileView(!isMobileView)}
                >
                  {isMobileView ? "Vista Desktop" : "Vista Mobile"}
                </Button>
              </div>

              <div className="flex gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-3">
                    {isMobileView ? "Versión Móvil" : "Versión Desktop"}
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <ToolPanel
                      activeTool={activeTool}
                      onToolChange={setActiveTool}
                      isMobile={isMobileView}
                      className="max-w-md"
                    />
                  </div>
                </div>
                
                <div className="w-80">
                  <h3 className="text-lg font-medium mb-3">Información de la Herramienta</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Herramienta Seleccionada</h4>
                      <p className="text-2xl font-bold text-purple-600 capitalize">{activeTool}</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Características</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Organizado por categorías</li>
                        <li>• Estado activo visual</li>
                        <li>• Responsive design</li>
                        <li>• Iconos intuitivos</li>
                        <li>• Tooltips informativos</li>
                      </ul>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Categorías</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Básico:</span>
                          <span className="text-gray-500">4 herramientas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Formas:</span>
                          <span className="text-gray-500">4 herramientas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Artístico:</span>
                          <span className="text-gray-500">2 herramientas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Selección:</span>
                          <span className="text-gray-500">6 herramientas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avanzado:</span>
                          <span className="text-gray-500">4 herramientas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default Index;
