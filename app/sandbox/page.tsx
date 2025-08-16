import { isSupabaseConfigured } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerceptionModule } from "@/components/sandbox/perception-module"
import { PlanningModule } from "@/components/sandbox/planning-module"
import { ActionModule } from "@/components/sandbox/action-module"
import { MemoryModule } from "@/components/sandbox/memory-module"
import { OrchestratorModule } from "@/components/sandbox/orchestrator-module"
import { ChatPreview } from "@/components/sandbox/chat-preview"

export default async function Sandbox() {
  // Temporarily bypass Supabase check for testing
  // if (!isSupabaseConfigured) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-stone-100">
  //       <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
  //     </div>
  //   )
  // }

  return (
    <div className="p-6 space-y-6 bg-stone-100 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">AI Agent Sandbox</h1>
        <p className="text-gray-600">Modular multi-agent architecture for CRM automation</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Agent Modules */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="perception" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 bg-stone-200 border border-gray-500">
              <TabsTrigger
                value="perception"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                Perception
              </TabsTrigger>
              <TabsTrigger value="planning" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                Planning
              </TabsTrigger>
              <TabsTrigger value="action" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                Action
              </TabsTrigger>
              <TabsTrigger value="memory" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                Memory
              </TabsTrigger>
              <TabsTrigger
                value="orchestrator"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                Orchestrator
              </TabsTrigger>
            </TabsList>
            <TabsContent value="perception">
              <PerceptionModule />
            </TabsContent>
            <TabsContent value="planning">
              <PlanningModule />
            </TabsContent>
            <TabsContent value="action">
              <ActionModule />
            </TabsContent>
            <TabsContent value="memory">
              <MemoryModule />
            </TabsContent>
            <TabsContent value="orchestrator">
              <OrchestratorModule />
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Preview */}
        <div className="xl:col-span-1">
          <ChatPreview />
        </div>
      </div>
    </div>
  )
}