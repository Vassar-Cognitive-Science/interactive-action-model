// Verification script to ensure experiments work correctly
import { EXPERIMENTS } from './wordSuperiority.js';

console.log('Testing all experiments...\n');

Object.entries(EXPERIMENTS).forEach(([key, exp]) => {
    console.log(`Running: ${exp.name}`);
    try {
        const result = exp.run();
        console.log(`  ✓ Success: ${result.data.length} series, ${result.timePoints.length} time points`);
        console.log(`  Title: ${result.title}`);
    } catch (error) {
        console.log(`  ✗ Failed: ${error.message}`);
    }
    console.log('');
});

console.log('All tests complete!');
