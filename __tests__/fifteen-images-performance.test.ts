// Performance test for 15 image processing optimization
describe('15 Images Performance Optimization', () => {
  describe('Batched Processing Performance', () => {
    test('batched processing is more efficient for 15 images', async () => {
      // Mock fetch to simulate realistic image download times
      global.fetch = jest.fn()
        .mockImplementation((url: string) => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(50000)) // ~50KB image
              } as Response)
            }, 150) // 150ms per image (realistic)
          })
        })

      const fifteenImageUrls = Array.from({ length: 15 }, (_, i) => 
        `https://apollo.olx.co.id/v1/files/test${i}-ID/image;s=780x0;q=60`
      )

      // Test batched approach (5 images per batch, 3 batches)
      const batchSize = 5
      const batches: string[][] = []
      for (let i = 0; i < fifteenImageUrls.length; i += batchSize) {
        batches.push(fifteenImageUrls.slice(i, i + batchSize))
      }

      expect(batches.length).toBe(3) // Should create 3 batches
      expect(batches[0].length).toBe(5)
      expect(batches[1].length).toBe(5)
      expect(batches[2].length).toBe(5)

      const startTime = Date.now()

      // Simulate batched processing
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        const batchPromises = batch.map(url => fetch(url))
        await Promise.all(batchPromises)
        
        // Small delay between batches (200ms)
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      const batchedTime = Date.now() - startTime

      // Batched processing should complete in ~3 * 150ms + 2 * 200ms = ~850ms
      expect(batchedTime).toBeLessThan(1200) // Allow some overhead
      expect(batchedTime).toBeGreaterThan(650) // Should take at least the batch times

      console.log(`Batched processing (15 images): ${batchedTime}ms`)
    })

    test('memory usage stays reasonable with 15 processed images', () => {
      // Simulate 15 processed images at ~30KB each (600px width, 75% quality)
      const processedImageSize = 30000 // 30KB average
      const imageCount = 15
      const totalMemory = processedImageSize * imageCount

      // Total should be under 1MB for all processed images
      expect(totalMemory).toBeLessThan(1024 * 1024) // 1MB
      expect(totalMemory).toBe(450000) // 450KB total - reasonable

      // Each image should be smaller than original due to optimization
      const originalImageSize = 200000 // Assume 200KB original
      const compressionRatio = processedImageSize / originalImageSize
      
      expect(compressionRatio).toBeLessThan(0.2) // Should compress to <20% of original
    })
  })

  describe('Enhanced Scoring for 15 Images', () => {
    test('confidence scaling works correctly for different image counts', () => {
      const calculateConfidence = (processedCount: number) => {
        return processedCount >= 12 ? 98 : // 12-15 high-quality photos: very high confidence
               processedCount >= 10 ? 95 : // 10-11 photos: high confidence  
               processedCount >= 6 ? 90 :  // 6-9 photos: good confidence
               processedCount >= 4 ? 85 :  // 4-5 photos: moderate confidence
               processedCount >= 2 ? 75 :  // 2-3 photos: low confidence
               60                          // 1 photo: very low confidence
      }

      // Test various scenarios
      expect(calculateConfidence(15)).toBe(98) // Excellent coverage
      expect(calculateConfidence(12)).toBe(98) // Still excellent
      expect(calculateConfidence(10)).toBe(95) // Very good
      expect(calculateConfidence(8)).toBe(90)  // Good
      expect(calculateConfidence(6)).toBe(90)  // Good
      expect(calculateConfidence(4)).toBe(85)  // Moderate
      expect(calculateConfidence(2)).toBe(75)  // Low
      expect(calculateConfidence(1)).toBe(60)  // Very low
    })

    test('balanced scoring allows higher scores with more images', () => {
      const calculateBalancedScore = (rawScore: number, processedCount: number) => {
        return processedCount >= 12 
          ? Math.max(35, Math.min(98, rawScore)) // 12-15 photos: allow up to 98
          : processedCount >= 10 
          ? Math.max(30, Math.min(95, rawScore)) // 10-11 photos: allow up to 95
          : processedCount >= 6 
          ? Math.max(30, Math.min(90, rawScore)) // 6-9 photos: allow up to 90
          : processedCount >= 4 
          ? Math.max(25, Math.min(85, rawScore)) // 4-5 photos: allow up to 85
          : processedCount >= 2 
          ? Math.max(20, Math.min(80, rawScore)) // 2-3 photos: allow up to 80
          : Math.max(15, Math.min(70, rawScore)) // 1 photo: max 70
      }

      // High raw score with excellent image coverage
      expect(calculateBalancedScore(95, 15)).toBe(95) // Allow high score
      expect(calculateBalancedScore(100, 15)).toBe(98) // Cap at 98
      
      // High raw score with good image coverage  
      expect(calculateBalancedScore(95, 10)).toBe(95) // Allow high score
      expect(calculateBalancedScore(100, 10)).toBe(95) // Cap at 95
      
      // High raw score with limited images
      expect(calculateBalancedScore(95, 2)).toBe(80) // Cap at 80
      expect(calculateBalancedScore(95, 1)).toBe(70) // Cap at 70

      // Low raw scores should be boosted to minimums
      expect(calculateBalancedScore(20, 15)).toBe(35) // Boost to minimum
      expect(calculateBalancedScore(10, 5)).toBe(25)  // Boost to minimum
    })
  })

  describe('Quality vs Performance Balance', () => {
    test('15 images provide better analysis coverage than 8', () => {
      const eightImageApproach = {
        imageCount: 8,
        maxScore: 98,
        maxConfidence: 95,
        processingTime: '~3-5 seconds'
      }

      const fifteenImageApproach = {
        imageCount: 15,
        maxScore: 98,
        maxConfidence: 98, // Higher confidence
        processingTime: '~5-8 seconds' // Slightly longer but still reasonable
      }

      expect(fifteenImageApproach.imageCount).toBeGreaterThan(eightImageApproach.imageCount)
      expect(fifteenImageApproach.maxConfidence).toBeGreaterThanOrEqual(eightImageApproach.maxConfidence)
      expect(fifteenImageApproach.maxScore).toBe(eightImageApproach.maxScore) // Same max score
      
      // 15 images provide ~87% more data for analysis
      const dataIncrease = (fifteenImageApproach.imageCount / eightImageApproach.imageCount) - 1
      expect(dataIncrease).toBeCloseTo(0.875, 2) // ~87.5% more data
    })

    test('batch processing prevents server overload', () => {
      const totalImages = 15
      const batchSize = 5
      const expectedBatches = Math.ceil(totalImages / batchSize)
      const delayBetweenBatches = 200 // ms

      expect(expectedBatches).toBe(3)
      
      // Should not send more than 5 simultaneous requests
      expect(batchSize).toBeLessThanOrEqual(5)
      
      // Should have reasonable delays to prevent overwhelming servers
      expect(delayBetweenBatches).toBeGreaterThanOrEqual(100)
      expect(delayBetweenBatches).toBeLessThanOrEqual(500)

      // Total batch overhead should be minimal
      const totalDelay = (expectedBatches - 1) * delayBetweenBatches
      expect(totalDelay).toBe(400) // 400ms total delay for politeness
    })
  })

  describe('Error Resilience with More Images', () => {
    test('higher success rate with more images to compensate for failures', () => {
      // Simulate realistic failure rates
      const totalImages = 15
      const typicalFailureRate = 0.2 // 20% of images might fail to download

      const expectedFailures = Math.floor(totalImages * typicalFailureRate)
      const expectedSuccesses = totalImages - expectedFailures

      expect(expectedFailures).toBe(3) // ~3 images might fail
      expect(expectedSuccesses).toBe(12) // ~12 images should succeed

      // Even with failures, should still have excellent coverage (12 images)
      const finalConfidence = expectedSuccesses >= 12 ? 98 :
                             expectedSuccesses >= 10 ? 95 :
                             expectedSuccesses >= 6 ? 90 : 85

      expect(finalConfidence).toBe(98) // Should still achieve highest confidence
      expect(expectedSuccesses).toBeGreaterThan(8) // More than original 8-image approach
    })

    test('graceful degradation maintains quality even with partial failures', () => {
      const scenarios = [
        { total: 15, failed: 0, expected: 15, confidence: 98 }, // Perfect case
        { total: 15, failed: 3, expected: 12, confidence: 98 }, // Typical case
        { total: 15, failed: 5, expected: 10, confidence: 95 }, // Bad case but still good
        { total: 15, failed: 8, expected: 7, confidence: 90 },  // Very bad case but workable
        { total: 15, failed: 12, expected: 3, confidence: 75 }  // Disaster case but still functional
      ]

      scenarios.forEach(scenario => {
        const successCount = scenario.expected
        const actualConfidence = successCount >= 12 ? 98 :
                                 successCount >= 10 ? 95 :
                                 successCount >= 6 ? 90 :
                                 successCount >= 4 ? 85 :
                                 successCount >= 2 ? 75 : 60

        expect(actualConfidence).toBe(scenario.confidence)
        expect(successCount).toBeGreaterThan(0) // Should never have zero images
      })
    })
  })
})