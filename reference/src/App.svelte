<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import AdvancedSDKIntegration from './lib/advanced-sdk-integration';
  import AIModule from './lib/ai_module';
  import AIProviders from './lib/ai-providers';
  import AITrainingDataCollector from './lib/ai-training-data-collector';
  import ApiSettingsStorage from './lib/api-settings-storage';
  import ChatMemory from './lib/chat_memory';
  import EffectsPresetsModule from './lib/effects-presets-module';
  import EnhancedAILearningSystem from './lib/enhanced-ai-learning-system';
  import EnhancedPerformanceSystem from './lib/enhanced-performance-system';
  import LayerAnalysisModule from './lib/layer-analysis-module';
  import LocalFileStorageManager from './lib/local-file-storage';
  import ModuleMonitor from './lib/module-monitor';
  import PanelLayout from './lib/panel-layout';
  import PresetLayout from './lib/preset-layout';
  import SimpleFileUpload from './lib/simple-file-upload';
  import SimpleSettingsManager from './lib/simple-settings-manager';
  import simpleToast from './lib/simple-toast';
  import SimpleYouTubeHelper from './lib/simple-youtube-helper';
  import SmartSuggestionEngine from './lib/smart-ai-suggestion-engine';
  import UIEnhancer from './lib/ui-animator';
  import UIInitializer from './lib/ui-init';

  let advancedSDKIntegration: AdvancedSDKIntegration;
  let aIModule: AIModule;
  let aIProviders: AIProviders;
  let aITrainingDataCollector: AITrainingDataCollector;
  let apiSettingsStorage: ApiSettingsStorage;
  let chatMemory: ChatMemory;
  let effectsPresetsModule: EffectsPresetsModule;
  let enhancedAILearningSystem: EnhancedAILearningSystem;
  let enhancedPerformanceSystem: EnhancedPerformanceSystem;
  let layerAnalysisModule: LayerAnalysisModule;
  let localFileStorageManager: LocalFileStorageManager;
  let moduleMonitor: ModuleMonitor;
  let panelLayout: PanelLayout;
  let presetLayout: PresetLayout;
  let simpleFileUpload: SimpleFileUpload;
  let simpleSettingsManager: SimpleSettingsManager;
  let simpleYouTubeHelper: SimpleYouTubeHelper;
  let smartSuggestionEngine: SmartSuggestionEngine;
  let uIEnhancer: UIEnhancer;
  let uIInitializer: UIInitializer;

  onMount(() => {
    advancedSDKIntegration = new AdvancedSDKIntegration();
    aIModule = new AIModule();
    aIProviders = new AIProviders();
    aITrainingDataCollector = new AITrainingDataCollector();
    apiSettingsStorage = new ApiSettingsStorage();
    chatMemory = new ChatMemory();
    effectsPresetsModule = new EffectsPresetsModule(chatMemory);
    enhancedAILearningSystem = new EnhancedAILearningSystem();
    enhancedPerformanceSystem = new EnhancedPerformanceSystem();
    layerAnalysisModule = new LayerAnalysisModule();
    localFileStorageManager = new LocalFileStorageManager();
    moduleMonitor = new ModuleMonitor();
    panelLayout = new PanelLayout();
    presetLayout = new PresetLayout();
    simpleFileUpload = new SimpleFileUpload();
    simpleSettingsManager = new SimpleSettingsManager();
    simpleYouTubeHelper = new SimpleYouTubeHelper();
    smartSuggestionEngine = new SmartSuggestionEngine();
    uIEnhancer = new UIEnhancer();
    uIInitializer = new UIInitializer();
  });

</script>

<body style="font-family:Arial;margin:10px;background:white;color:black;font-size:12px;">
    <h3>LetterBlack Gen AI - Complete Edition</h3>
    
    <!-- AI Status Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>🤖 Smart AI Status</h4>
        <p>Status: <span id="ai-status">Ready</span></p>
        <p>Suggestions: <span id="suggestion-count">0</span></p>
        <p>Learning Quality: <span id="learning-quality">Initializing...</span></p>
        <button on:click={() => smartSuggestionEngine.generateSuggestions(true)} style="padding:5px 10px;margin:3px;">Activate Smart AI</button>
        <button on:click={() => smartSuggestionEngine.generateSuggestions()} style="padding:5px 10px;margin:3px;">Generate Suggestions</button>
    </div>
    
    <!-- Performance Metrics Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>📊 Performance Metrics</h4>
        <p>Memory Usage: <span id="memory-usage">--</span></p>
        <p>CPU Usage: <span id="cpu-usage">--</span></p>
        <p>System Health: <span id="system-health">Good</span></p>
        <p>Active Layers: <span id="active-layers">0</span></p>
        <button on:click={() => enhancedPerformanceSystem.getIntelligentMetrics()} style="padding:5px 10px;margin:3px;">Refresh Metrics</button>
    </div>
    
    <!-- Layer Analysis Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>🎬 Layer Analysis</h4>
        <p>Total Layers: <span id="total-layers">0</span></p>
        <p>Complexity Score: <span id="complexity-score">Low</span></p>
        <p>Issues Found: <span id="issues-found">0</span></p>
        <button on:click={() => layerAnalysisModule.analyzeLayers()} style="padding:5px 10px;margin:3px;">Analyze Project</button>
        <button on:click={() => layerAnalysisModule.getOptimizations()} style="padding:5px 10px;margin:3px;">Optimize</button>
    </div>
    
    <!-- Smart Suggestions Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>💡 Smart Suggestions</h4>
        <div id="suggestions-container" style="min-height:80px;background:#f9f9f9;padding:8px;border:1px solid #ddd;">
            <p id="suggestions-text">Press "Activate Smart AI" to begin intelligent analysis...</p>
        </div>
        <button on:click={() => smartSuggestionEngine.implementSuggestion()} style="padding:5px 10px;margin:3px;">Implement Top Suggestion</button>
        <button on:click={() => smartSuggestionEngine.handleFeedback('positive')} style="padding:5px 10px;margin:3px;">👍 Good</button>
        <button on:click={() => smartSuggestionEngine.handleFeedback('negative')} style="padding:5px 10px;margin:3px;">👎 Poor</button>
    </div>
    
    <!-- AI Training Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>🧠 AI Training & Learning</h4>
        <p>Training Mode: 
            <select id="training-mode" on:change={(e) => enhancedAILearningSystem.updateTrainingMode(e.target.value)} style="margin:3px;">
                <option value="beginner">Beginner</option>
                <option value="intermediate" selected>Intermediate</option>
                <option value="advanced">Advanced</option>
            </select>
        </p>
        <p>Learning Rate: <span id="learning-rate">Medium</span></p>
        <p>Data Collection: <span id="data-collection">Active</span></p>
        <button on:click={() => aITrainingDataCollector.exportTrainingDataForML()} style="padding:5px 10px;margin:3px;">Export Training Data</button>
        <button on:click={() => enhancedAILearningSystem.resetLearning()} style="padding:5px 10px;margin:3px;">Reset Learning</button>
    </div>
    
    <!-- Quick Actions Section -->
    <div style="border:1px solid #ccc;padding:8px;margin:8px 0;">
        <h4>⚡ Quick Actions</h4>
        <button on:click={() => simpleToast.info('Quick Fix clicked')} style="padding:5px 10px;margin:3px;background:#28a745;color:white;">Quick Fix</button>
        <button on:click={() => simpleToast.info('Organize Project clicked')} style="padding:5px 10px;margin:3px;background:#007bff;color:white;">Organize Project</button>
        <button on:click={() => simpleToast.info('Performance Boost clicked')} style="padding:5px 10px;margin:3px;background:#ffc107;color:black;">Performance Boost</button>
        <button on:click={() => simpleToast.info('Help clicked')} style="padding:5px 10px;margin:3px;">Help & Shortcuts</button>
    </div>
    
    <!-- Status Bar -->
    <div style="border-top:1px solid #ccc;padding:5px;margin:8px 0;background:#f0f0f0;font-size:11px;">
        <span id="status-message">Ready - Press Ctrl+Shift+S for Smart AI</span>
        <span style="float:right;" id="timestamp">--</span>
    </div>

</body>

<style>
  main {
    font-family: sans-serif;
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 2em;
    font-weight: 100;
  }
</style>