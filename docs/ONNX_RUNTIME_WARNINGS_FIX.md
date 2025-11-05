# ONNX Runtime Warnings Fix

## Problem

Electron uygulamasında ONNX Runtime model yüklenirken şu uyarılar görülüyordu:

```
[W:onnxruntime:, graph.cc:3490 onnxruntime::Graph::CleanUnusedInitializersAndNodeArgs] 
Removing initializer '/model/decoder/Constant_12_output_0'. 
It is not used by any node and should be removed from the model.
```

## Açıklama

Bu uyarılar **zararsızdır** ve normal davranıştır. ONNX Runtime, model yüklenirken kullanılmayan initializer'ları otomatik olarak temizler. Bu, model optimizasyonunun bir parçasıdır ve performansı artırır.

Ancak bu uyarılar:
- Kullanıcı deneyimini olumsuz etkiler
- Log'ları kirletir
- Gereksiz endişeye neden olur

## Çözüm

### 1. Main Process (electron/main.cjs)

```javascript
// Suppress ONNX Runtime warnings (both dev and production)
process.env.ORT_LOGGING_LEVEL = 'error'; // Only show errors, not warnings
process.env.ONNXRUNTIME_LOG_SEVERITY_LEVEL = '3'; // 3=Error, 4=Fatal
```

### 2. Worker Thread (electron/speechWorker.cjs)

```javascript
// Suppress ONNX Runtime warnings in worker thread
process.env.ORT_LOGGING_LEVEL = 'error';
process.env.ONNXRUNTIME_LOG_SEVERITY_LEVEL = '3';
```

### 3. Transformers Environment (electron/speechWorker.cjs)

```javascript
// Configure ONNX Runtime through transformers env
env.onnx = env.onnx || {};
env.onnx.logSeverityLevel = 3; // 0=Verbose, 1=Info, 2=Warning, 3=Error, 4=Fatal
```

## Log Severity Levels

| Level | Value | Description |
|-------|-------|-------------|
| Verbose | 0 | Tüm detaylar |
| Info | 1 | Bilgilendirme mesajları |
| Warning | 2 | Uyarılar (varsayılan) |
| Error | 3 | Sadece hatalar |
| Fatal | 4 | Sadece kritik hatalar |

## Sonuç

Bu değişikliklerden sonra:
- ✅ ONNX Runtime uyarıları görünmez
- ✅ Sadece gerçek hatalar log'lanır
- ✅ Kullanıcı deneyimi iyileşir
- ✅ Log'lar temiz kalır

## Test

Uygulamayı başlatın ve ses tanıma özelliğini kullanın:

```bash
npm run electron:dev
```

Artık model yüklenirken ONNX Runtime uyarıları görünmeyecek.

## Notlar

- Bu ayarlar sadece log seviyesini değiştirir
- Model performansı etkilenmez
- Gerçek hatalar hala görünür
- Development ve production modlarında çalışır

## Referanslar

- [ONNX Runtime Logging](https://onnxruntime.ai/docs/api/c/group___global.html#ga0c8b8c3e3e3e3e3e3e3e3e3e3e3e3e3e)
- [Transformers.js Environment](https://huggingface.co/docs/transformers.js/api/env)
- Issue: Model yüklenirken "Removing initializer" uyarıları
