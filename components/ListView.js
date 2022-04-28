import React from 'react';
import Feature from './Feature';

export default function ListView({
  txHistory,
  compareGas,
  showNum,
}) {
  return (
    <div>
      {txHistory
        .sort(compareGas)
        .slice(0, showNum)
        .map((ele, idx) => (
          <div key={idx}>
            {ele && (
              <Feature
                mb={4}
                title={ele.hash}
                gas={ele.gas}
                gasPrice={ele.gasPrice}
                maxFee={ele.maxFeePerGas}
                maxPriorityFee={ele.maxPriorityFeePerGas}
                time={ele.timestamp}
              />
            )}
          </div>
        ))}
    </div>
  );
}
