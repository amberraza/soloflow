import React from 'react';
import { useParams } from 'react-router-dom';
import FinancialWizard from '../financials/FinancialWizard';

const WidgetPage = () => {
    const { firmId } = useParams();

    // In the future, we can use firmId to fetch firm branding or configurations
    // console.log("Rendering widget for firm:", firmId);

    return (
        <div className="widget-container">
            <FinancialWizard isWidget={true} />
        </div>
    );
};

export default WidgetPage;
