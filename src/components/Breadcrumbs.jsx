import React from 'react'
export default function Breadcrumbs({trail=[]}){if(!trail?.length)return null;return <div className='breadcrumb'>{trail.join(' > ')}</div>}
