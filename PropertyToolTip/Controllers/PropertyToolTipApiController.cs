using Asp.Versioning;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PropertyToolTip;

namespace PropertyToolTip.Controllers
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "PropertyToolTip")]
    public class PropertyToolTipApiController : PropertyToolTipApiControllerBase
    {
        private readonly IWebHostEnvironment _webHostEnvironment;

        public PropertyToolTipApiController(IWebHostEnvironment webHostEnvironment) =>
            _webHostEnvironment = webHostEnvironment;

        [HttpGet("ping")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        public string Ping() => "Pong";

        [HttpGet("settings")]
        [ProducesResponseType<PropertyToolTipOptions>(StatusCodes.Status200OK)]
        public ActionResult<PropertyToolTipOptions> GetSettings() =>
            Ok(PropertyToolTipEffectiveSettings.Resolve(_webHostEnvironment));

        [HttpPost("settings")]
        [IgnoreAntiforgeryToken]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SaveSettings([FromBody] PropertyToolTipOptions? model, CancellationToken cancellationToken)
        {
            if (model is null)
            {
                return BadRequest("Request body is required.");
            }

            PropertyToolTipEffectiveSettings.Clamp(model);
            await PropertyToolTipEffectiveSettings.SaveAsync(_webHostEnvironment, model, cancellationToken);
            return NoContent();
        }
    }
}
