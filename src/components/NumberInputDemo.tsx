import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NumberInputWithSlider from '@/components/ui/number-input-with-slider';

const NumberInputDemo = () => {
  const [value1, setValue1] = useState(1000);
  const [value2, setValue2] = useState(5000);
  const [value3, setValue3] = useState(15000);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Number Input with Slider Demo</h1>
        <p className="text-gray-600">
          This demo showcases the NumberInputWithSlider component with different configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo 1: Default Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Default Configuration</CardTitle>
            <p className="text-sm text-gray-600">
              Slider: 0-10,000, Input: 0-100,000
            </p>
          </CardHeader>
          <CardContent>
            <NumberInputWithSlider
              value={value1}
              onChange={setValue1}
              label="Quantity"
              placeholder="Enter quantity"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium">Current Value: {value1.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Demo 2: Custom Range */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Range</CardTitle>
            <p className="text-sm text-gray-600">
              Slider: 100-5,000, Input: 100-50,000
            </p>
          </CardHeader>
          <CardContent>
            <NumberInputWithSlider
              value={value2}
              onChange={setValue2}
              min={100}
              sliderMax={5000}
              inputMax={50000}
              step={100}
              label="Custom Range"
              placeholder="Enter value"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium">Current Value: {value2.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Demo 3: Value Exceeding Slider Max */}
        <Card>
          <CardHeader>
            <CardTitle>Value Exceeding Slider Max</CardTitle>
            <p className="text-sm text-gray-600">
              This demonstrates when a value exceeds the slider range
            </p>
          </CardHeader>
          <CardContent>
            <NumberInputWithSlider
              value={value3}
              onChange={setValue3}
              min={0}
              sliderMax={10000}
              inputMax={100000}
              step={1000}
              label="Large Value"
              placeholder="Enter large value"
            />
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium">Current Value: {value3.toLocaleString()}</div>
              {value3 > 10000 && (
                <div className="text-xs text-amber-600 mt-1">
                  ⚠️ Value exceeds slider range (10,000)
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo 4: Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
            <p className="text-sm text-gray-600">
              Component in disabled state
            </p>
          </CardHeader>
          <CardContent>
            <NumberInputWithSlider
              value={5000}
              onChange={() => {}}
              min={0}
              sliderMax={10000}
              inputMax={100000}
              label="Disabled Input"
              disabled={true}
            />
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium">Fixed Value: 5,000</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Slider has a maximum value of 10,000 (or custom sliderMax)</li>
                <li>Text input can accept values up to 100,000 (or custom inputMax)</li>
                <li>When text input exceeds slider max, slider stays at maximum</li>
                <li>Real-time validation with clear error messages</li>
                <li>Automatic formatting with thousands separators</li>
                <li>Visual indicators when value exceeds slider range</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Props:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><code>value</code> - Current numeric value</div>
                <div><code>onChange</code> - Callback when value changes</div>
                <div><code>min</code> - Minimum value (default: 0)</div>
                <div><code>sliderMax</code> - Maximum slider value (default: 10,000)</div>
                <div><code>inputMax</code> - Maximum input value (default: 100,000)</div>
                <div><code>step</code> - Step increment (default: 1)</div>
                <div><code>label</code> - Optional label text</div>
                <div><code>disabled</code> - Disable the component</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberInputDemo; 