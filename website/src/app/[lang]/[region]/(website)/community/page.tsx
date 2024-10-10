// Client Component
"use client";
import { useEffect, useRef } from 'react';

function D3Bubbles() {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const width = 500, height = 200, radius = 4;
    const center = { x: width / 2, y: height / 2 };

    useEffect(() => {
        // Generate random nodes
        interface CustomNode extends d3.SimulationNodeDatum {
            side: 'left' | 'right';
            radius: number;
        }

        let nodes: CustomNode[] = Array.from({ length: 50 }, () => ({
            radius: radius,
            side: Math.random() < 0.35 ? 'left' : 'right',
            x: 0.2 * width + Math.random() * 0.6 * width || 0,
            y: 0.2 * height + Math.random() * 0.6 * height || 0
        }));

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('viewBox', `0 0 ${width} ${height}`);

        // Create circles with a single color
        let bubbles = svg.selectAll('.bubble')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'bubble')
            .attr('r', 0)
            .attr('fill', '#FAC800');

        // Transition bubbles to final size
        bubbles.transition().duration(500).attr('r', d => d.radius);

        // Define force simulation
        let simulation = d3.forceSimulation()
            .velocityDecay(0.23)
            .force('x', d3.forceX().strength(0.03).x(center.x))
            .force('y', d3.forceY().strength(0.03).y(center.y))
            .force('charge', d3.forceManyBody().strength(-1))
            .on('tick', () => {
                bubbles.attr('cx', d => d.x ?? 0).attr('cy', d => d.y ?? 0);
            })
            .nodes(nodes)
            .stop();

        // Group and split functions
        function groupBubbles() {
            simulation.force('x', d3.forceX().strength(0.03).x(center.x));
            simulation.alpha(2).restart();
        }

        function splitBubbles() {
            simulation.force('x', d3.forceX().strength(0.03).x(d => ((d as CustomNode).side === 'left' ? width * 0.25 : width * 0.75)));
            simulation.alpha(3).restart();
        }

        // Toggle layout on click
        let grouped = true;
        document.onclick = () => {
            grouped = !grouped;
            grouped ? groupBubbles() : splitBubbles();
        };

        // Initial layout
        groupBubbles();
        setTimeout(splitBubbles, 1500);
        setTimeout(groupBubbles, 2500);
    }, [center.x, center.y]);

    return (
        <svg ref={svgRef} style={{ width: '100%', maxHeight: '100%' }} />
    );
}

export { D3Bubbles };

// Server Component
import { DefaultPageProps } from '@/app/[lang]/[region]';
import { useState } from 'react';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';
import * as d3 from 'd3';

export default function Page({ params }: DefaultPageProps) {
  const [translator, setTranslator] = useState<Translator | null>(null);

  useEffect(() => {
    async function fetchTranslator() {
      const translatorInstance = await Translator.getInstance({
        language: params.lang,
          namespaces: ['website-community'],
         });
        setTranslator(translatorInstance);
      }
    fetchTranslator();
  }, [params.lang]);

  if (!translator) {
    return <></>;
  }

  return (
	  <BaseContainer className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-12 pt-10 w-full">
    	<div className="flex flex-col space-y-6 md:w-1/2 w-full max-w-lg">
        <Typography as="h1" size="5xl" weight="bold" lineHeight="normal">
          {translator.t('title')}
        </Typography>
        
        <Typography as="h2" weight="medium" size="3xl" lineHeight="normal">
          {translator.t('lead')}
        </Typography>

        {/* D3Bubbles mobile */}
      <div className="md:hidden flex justify-center md:justify-end w-full md:w-4/5">
        <D3Bubbles />
      </div>
    
        {/* Community Members */}
        <div className="flex items-center space-x-4">
          <span className="bg-[#FAC800] w-4 h-4 rounded-full"></span>
          <Typography size="xl" className="leading-4">{translator.t('community-members')}</Typography>
        </div>

        {/* Contributors */}
        <div className="">
          <div className="flex items-center space-x-4 ">
            <span className="bg-[#D9D9D9] w-4 h-4 rounded-full"></span>
            <Typography size="xl" className="leading-2">{translator.t('contributors')}</Typography>
          </div>
          <Typography size="xl" className="px-8">{translator.t('contributors-note')}</Typography>
        </div>
          
        {/* Recipients */}
        <div className="">
          <div className="flex items-center space-x-4 ">
            <span className="bg-[#D9D9D9] w-4 h-4 rounded-full"></span>
            <Typography size="xl" className="">{translator.t('recipients')}</Typography>
          </div>
          <Typography size="xl" className="px-8">{translator.t('recipients-note')}</Typography>
        </div>

        {/* Volunteers */}
        <div className="">
          <div className="flex items-center space-x-4 ">
            <span className="bg-[#D9D9D9] w-4 h-4 rounded-full"></span>
            <Typography size="xl" className="">{translator.t('volunteers')}</Typography>
          </div>
          <Typography size="xl" className="px-8">{translator.t('volunteers-note')}</Typography>	
        </div>
    	</div>

      {/* D3Bubbles lg */}
      <div className="hidden md:flex justify-center md:justify-end w-full md:w-4/5">
        <D3Bubbles />
      </div>
    </BaseContainer>

	
  );
}
