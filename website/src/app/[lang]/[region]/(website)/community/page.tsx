// Client Component
"use client";
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface D3BubblesProps {
  activeCategory: string | null;
}

function D3Bubbles({ activeCategory }: D3BubblesProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const width = 500, height = 500, radius = 5;
  const center = { x: width / 2, y: height / 2 };

  useEffect(() => {
    interface CustomNode extends d3.SimulationNodeDatum {
      side: 'left' | 'right';
      radius: number;
      category: string;
    }

    const categories = ['community-members', 'contributors', 'recipients', 'volunteers'];
    let nodes: CustomNode[] = Array.from({ length: 300 }, (_, i) => ({
      radius,
      side: Math.random() < 0.35 ? 'left' : 'right',
      x: 0.2 * width + Math.random() * 0.6 * width || 0,
      y: 0.2 * height + Math.random() * 0.6 * height || 0,
      category: categories[i % categories.length],
    }));

    const colorMap: { [key: string]: string } = {
      'community-members': '#FAC800',
      'contributors': '#3373BB',
      'recipients': '#F55D3E',
      'volunteers': '#9747FF',
      'default': '#FAC800',
    };

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`);
    
    let bubbles = svg.selectAll('.bubble')
      .data(nodes, d => (d as CustomNode).category)
      .join(
        enter => enter.append('circle')
          .attr('class', 'bubble')
          .attr('r', 0)
          .attr('fill', d => activeCategory && d.category === activeCategory ? colorMap[activeCategory] : colorMap['default'])
          .attr('opacity', d => (activeCategory && d.category !== activeCategory) ? 0 : 1)
          .call(enter => enter.transition().duration(500).attr('r', d => d.radius)),
        update => update
          .attr('fill', d => activeCategory && d.category === activeCategory ? colorMap[activeCategory] : colorMap['default'])
          .attr('opacity', d => (activeCategory && d.category !== activeCategory) ? 0 : 1)
          .call(update => update.transition().duration(100))
      );

    const simulation = d3.forceSimulation()
      .velocityDecay(0.23)
      .force('x', d3.forceX().strength(0.03).x(d => (activeCategory && (d as CustomNode).category === activeCategory) ? center.x : width * ((d as CustomNode).side === 'left' ? 0.25 : 0.75)))
      .force('y', d3.forceY().strength(0.03).y(center.y))
      .force('charge', d3.forceManyBody().strength(-1))
      .on('tick', () => {
        bubbles.attr('cx', d => d.x ?? 0).attr('cy', d => d.y ?? 0);
      })
      .nodes(nodes)
      .alpha(1)
      .restart();
  }, [center.x, center.y, activeCategory]);

  return (
    <svg ref={svgRef} style={{ width: '100%', maxHeight: '50%' }} />
  );
}



// Server Component
import { DefaultPageProps } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default function Page({ params }: DefaultPageProps) {
  const [translator, setTranslator] = useState<Translator | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  const categories = [
    { name: 'community-members', color: '#FAC800' },
    { name: 'contributors', color: '#3373BB' },
    { name: 'recipients', color: '#F55D3E' },
    { name: 'volunteers', color: '#9747FF' },
  ];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  return (
    <BaseContainer className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-12 pt-10 w-full">
      <div className="flex flex-col space-y-6 md:w-1/2 w-full max-w-lg">
        <Typography as="h1" size="5xl" weight="bold" lineHeight="normal">
          {translator.t('title')}
        </Typography>
        
        <Typography as="h2" weight="medium" size="3xl" lineHeight="normal">
          {translator.t('lead')}
        </Typography>
        <div className="md:hidden flex justify-center md:justify-end w-full md:w-4/5">
        <D3Bubbles activeCategory={activeCategory} />
      </div>

        {/* Render category buttons */}
        {categories.map(category => (
          <div key={category.name} onClick={() => handleCategoryClick(category.name)}>
            <div className="flex items-center space-x-4 cursor-pointer">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color, opacity: activeCategory && activeCategory !== category.name ? 0.3 : 1 }}
              ></span>
              <Typography size="xl" className={activeCategory === category.name ? 'font-bold' : ''}>
                {translator.t(category.name)}
              </Typography>
            </div>
            {activeCategory === category.name && (
              <Typography size="xl" className="px-8">
                {translator.t(`${category.name}-note`)}
              </Typography>
            )}
          </div>
        ))}
      </div>

      <div className="hidden md:flex justify-center md:justify-end w-full md:w-4/5">
        <D3Bubbles activeCategory={activeCategory} />
      </div>
    </BaseContainer>
  );
}


